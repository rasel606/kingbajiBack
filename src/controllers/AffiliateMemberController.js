const User = require('../models/User');
const AffiliateModel = require('../models/AffiliateModel');
const ExcelJS = require('exceljs');

// Helper function to build query from search parameters
const buildSearchQuery = (referralCode, params) => {
  const query = { referredBy: referralCode };
  
  // Date range filter
  if (params.startTime && params.endTime) {
    query.timestamp = {
      $gte: new Date(params.startTime),
      // $lte: new Date(params.endTime)
    };
  }
  
  // Username filter
  if (params.playerFormUserId) {
    query.userId = { $regex: params.playerFormUserId, $options: 'i' };
  }
  
  // Last login IP filter
  if (params.loginIp) {
    query.lastLoginIp = params.loginIp;
  }
  
  // Last bet time filter
  if (params.lastBetTimeSince) {
    query.last_game_id = { $gte: new Date(params.lastBetTimeSince) };
  }
  
  // Last deposit time filter
  if (params.lastDepositSince) {
    query.lastDepositTime = { $gte: new Date(params.lastDepositSince) };
  }
  
  // Currency filter
  // if (params.currency) {
  //   query.currency = params.currency;
  // }
  
  return query;
};

// Search members with pagination
exports.searchMembers = async (req, res) => {
  try {
    const affiliate = await AffiliateModel.findById(req.user._id);
    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }
    
    const { 
      startTime, 
      endTime, 
      playerFormUserId, 
      loginIp, 
      lastBetTimeSince, 
      lastDepositSince,
      currency,
      page = 1,
      limit = 10
    } = req.query;
    
    // Build the query
    const query = buildSearchQuery(
      
      affiliate.referralCode,
      { startTime, endTime, playerFormUserId, loginIp, lastBetTimeSince, lastDepositSince, currency }
    );
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    // Get paginated results
    const members = await User.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('userId name createdAt lastLoginIp lastLoginTime lastDepositTime lastBetTime currency')
      .lean();
    console.log(members)
    // Format response for frontend
    const formattedMembers = members.map(member => ({
      'Registered Time': member.timestamp,
      'Username': member.userId,
      'Affiliate URL': `${process.env.BASE_URL}/join?ref=${affiliate.referralCode}`,
      'Last Login IP': member.lastLoginIp || '',
      'Sign Up': 'Direct', // Can be enhanced based on actual signup method
      'Last Login Time': member.lastLoginTime ? member.lastLoginTime.toISOString() : '',
      'Last Deposit': member.lastDepositTime ? member.lastDepositTime.toISOString() : '',
      'Last Bet Time': member.lastBetTime ? member.lastBetTime.toISOString() : '',
      'Currency Type': member.currency || 'BDT'
    }));
    
    console.log(formattedMembers)
    res.json({
      draw: parseInt(req.query.draw) || 1,
      recordsTotal: total,
      recordsFiltered: total,
      data: formattedMembers
    });
    
  } catch (error) {
    console.error('Member search error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to search members'
    });
  }
};

// Export members to Excel
exports.exportMembers = async (req, res) => {

  console.log("req.query ----------------------1",req.query)
  try {
    const affiliate = await AffiliateModel.findById(req.user._id);
    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }
    
    const { 
      startTime, 
      endTime, 
      playerFormUserId, 
      loginIp, 
      lastBetTimeSince, 
      lastDepositSince,
      currency
    } = req.query;
    console.log("req.query",req.query)
    // Build the query
    const query = buildSearchQuery(
      req.user._id,
      affiliate.referralCode,
      { startTime, endTime, playerFormUserId, loginIp, lastBetTimeSince, lastDepositSince, currency }
    );
    
    // Get all matching members (without pagination)
    console.log("sbdf114",query)
    const members = await User.find(query)
      .sort({ timestamp: -1 })
      // .select('userId name createdAt lastLoginIp lastLoginTime lastDepositTime lastBetTime currency')
      // .lean();
    
    // Format data for Excel export
    const excelData = members.map(member => ({
      'Registered Time': member.createdAt.toISOString(),
      'Username': member.userId,
      'Affiliate URL': `${process.env.BASE_URL}/join?ref=${affiliate.referralCode}`,
      'Last Login IP': member.lastLoginIp || '',
      'Sign Up': 'Direct',
      'Last Login Time': member.lastLoginTime ? member.lastLoginTime.toISOString() : '',
      'Last Deposit': member.lastDepositTime ? member.lastDepositTime.toISOString() : '',
      'Last Bet Time': member.lastBetTime ? member.lastBetTime.toISOString() : '',
      'Currency Type': member.currency || 'BDT'
    }));
    
    // Generate Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Affiliate Members');
    
    // Add headers
    const headers = Object.keys(excelData[0] || {});
    worksheet.addRow(headers);
    
    // Add data rows
    excelData.forEach(item => {
      const row = headers.map(header => item[header]);
      worksheet.addRow(row);
    });
    
    // Style headers
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
    });
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Send Excel file as response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=affiliate_members.xlsx');
    res.send(buffer);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to export members'
    });
  }
};