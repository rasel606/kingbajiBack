const e = require('express');
const mongoose = require('mongoose');

const contactsTableSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userid: { type: String, required: true },
    is_primary: { type: Boolean, default: false },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phonenumber: { type: String },
    title: { type: String },
    datecreated: { type: Date, default: Date.now },
    password: { type: String, required: true },
    new_pass_key: { type: String },
    new_pass_key_requested: { type: Date },
    email_verified_at: { type: Date },
    email_verification_key: { type: String },
    email_verification_sent_at: { type: Date },
    last_ip: { type: String },
    last_login: { type: Date },
    last_password_change: { type: Date },
    active: { type: Boolean, default: true },
    profile_image: { type: String },
    direction: { type: String },
    invoice_emails: { type: Boolean, default: false },
    estimate_emails: { type: Boolean, default: false },
    credit_note_emails: { type: Boolean, default: false },
    contract_emails: { type: Boolean, default: false },
    task_emails: { type: Boolean, default: false },
    project_emails: { type: Boolean, default: false },
    ticket_emails: { type: Boolean, default: false },
    balance: { type: Number, default: 0 },
    agent_deposit: { type: Number, default: 0 },
    agent_withdrow: { type: Number, default: 0 },
    create_by: { type: String },
    last_payment: { type: Date },

  timestamp: { type: Date, default: Date.now },
  updatetimestamp: { type: Date, default: Date.now },
});

const contactsTable = mongoose.model('contactsTable', contactsTableSchema);

module.exports = contactsTable;