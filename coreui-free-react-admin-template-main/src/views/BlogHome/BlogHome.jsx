// src/components/BlogHome.js
import React from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CCardImage,
  CButton,
  CNavbar,
  CNavbarBrand,
  CNavbarNav,
  CNavbarToggler,
  CCollapse,
  CNavItem,
  CNavLink,
  CForm,
  CFormInput,
  CInputGroup,
  CFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilUser, cilCalendar } from '@coreui/icons'

const BlogHome = () => {
  const [visible, setVisible] = React.useState(false)

  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: 'Getting Started with React',
      excerpt:
        'Learn the fundamentals of React and how to build your first application with modern best practices.',
      image: 'https://via.placeholder.com/350x200/4f5d73/ffffff?text=React',
      author: 'John Doe',
      date: 'March 15, 2024',
      category: 'React',
    },
    {
      id: 2,
      title: 'Mastering CSS Grid',
      excerpt:
        'A comprehensive guide to CSS Grid layout and how to create complex responsive layouts with ease.',
      image: 'https://via.placeholder.com/350x200/2d8cff/ffffff?text=CSS+Grid',
      author: 'Jane Smith',
      date: 'March 12, 2024',
      category: 'CSS',
    },
    {
      id: 3,
      title: 'JavaScript ES6+ Features',
      excerpt:
        'Explore the latest JavaScript features including arrow functions, destructuring, and async/await.',
      image: 'https://via.placeholder.com/350x200/f9ac00/ffffff?text=JavaScript',
      author: 'Mike Johnson',
      date: 'March 10, 2024',
      category: 'JavaScript',
    },
    {
      id: 4,
      title: 'Building RESTful APIs with Node.js',
      excerpt: 'Learn how to create robust RESTful APIs using Node.js, Express, and MongoDB.',
      image: 'https://via.placeholder.com/350x200/00b894/ffffff?text=Node.js',
      author: 'Sarah Wilson',
      date: 'March 8, 2024',
      category: 'Backend',
    },
    {
      id: 5,
      title: 'Responsive Design Principles',
      excerpt:
        'Master the art of responsive web design and create websites that work perfectly on all devices.',
      image: 'https://via.placeholder.com/350x200/ff7675/ffffff?text=Responsive',
      author: 'David Brown',
      date: 'March 5, 2024',
      category: 'Design',
    },
    {
      id: 6,
      title: 'Introduction to TypeScript',
      excerpt:
        'Discover how TypeScript can improve your JavaScript development with static typing and better tooling.',
      image: 'https://via.placeholder.com/350x200/007acc/ffffff?text=TypeScript',
      author: 'Emily Davis',
      date: 'March 3, 2024',
      category: 'TypeScript',
    },
  ]

  const popularPosts = blogPosts.slice(0, 3)
  const categories = ['React', 'JavaScript', 'CSS', 'TypeScript', 'Backend', 'Design']

  return (
    <div className="bg-light min-vh-100">
      {/* Navigation Bar */}
      <CNavbar expand="lg" colorScheme="light" className="bg-white shadow-sm">
        <CContainer>
          <CNavbarBrand href="#" className="fw-bold text-primary">
            MyBlog
          </CNavbarBrand>
          <CNavbarToggler onClick={() => setVisible(!visible)} />
          <CCollapse className="navbar-collapse" visible={visible}>
            <CNavbarNav className="me-auto mb-2 mb-lg-0">
              <CNavItem>
                <CNavLink href="#" active>
                  Home
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Categories</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">About</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#">Contact</CNavLink>
              </CNavItem>
            </CNavbarNav>
            <CForm className="d-flex">
              <CInputGroup>
                <CFormInput type="search" placeholder="Search posts..." aria-label="Search" />
                <CButton type="submit" color="primary">
                  <CIcon icon={cilSearch} />
                </CButton>
              </CInputGroup>
            </CForm>
          </CCollapse>
        </CContainer>
      </CNavbar>

      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <CContainer>
          <CRow className="align-items-center">
            <CCol lg={8}>
              <h1 className="display-4 fw-bold mb-3">Welcome to MyBlog</h1>
              <p className="lead mb-4">
                Discover amazing articles about web development, programming tips, and the latest
                trends in technology.
              </p>
              <CButton color="light" size="lg">
                Start Reading
              </CButton>
            </CCol>
          </CRow>
        </CContainer>
      </section>

      {/* Main Content */}
      <CContainer className="py-5">
        <CRow>
          {/* Blog Posts */}
          <CCol lg={8}>
            <h2 className="mb-4">Latest Posts</h2>
            <CRow>
              {blogPosts.map((post) => (
                <CCol md={6} className="mb-4" key={post.id}>
                  <CCard className="h-100 shadow-sm">
                    <CCardImage orientation="top" src={post.image} />
                    <CCardBody className="d-flex flex-column">
                      <div className="mb-2">
                        <span className="badge bg-primary">{post.category}</span>
                      </div>
                      <CCardTitle className="h5">{post.title}</CCardTitle>
                      <CCardText className="flex-grow-1">{post.excerpt}</CCardText>
                      <div className="mt-auto">
                        <div className="d-flex align-items-center text-muted small mb-3">
                          <CIcon icon={cilUser} className="me-1" />
                          <span className="me-3">{post.author}</span>
                          <CIcon icon={cilCalendar} className="me-1" />
                          <span>{post.date}</span>
                        </div>
                        <CButton color="primary" href={`/post/${post.id}`}>
                          Read More
                        </CButton>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              ))}
            </CRow>
          </CCol>

          {/* Sidebar */}
          <CCol lg={4}>
            {/* About Section */}
            <CCard className="mb-4 shadow-sm">
              <CCardBody>
                <h5 className="card-title">About This Blog</h5>
                <p className="card-text">
                  Welcome to my personal blog where I share insights about web development,
                  programming tutorials, and tech industry trends.
                </p>
                <CButton color="outline-primary" size="sm">
                  Learn More
                </CButton>
              </CCardBody>
            </CCard>

            {/* Popular Posts */}
            <CCard className="mb-4 shadow-sm">
              <CCardBody>
                <h5 className="card-title">Popular Posts</h5>
                {popularPosts.map((post) => (
                  <div key={post.id} className="mb-3 pb-3 border-bottom">
                    <h6 className="mb-1">
                      <a href={`/post/${post.id}`} className="text-decoration-none">
                        {post.title}
                      </a>
                    </h6>
                    <small className="text-muted">{post.date}</small>
                  </div>
                ))}
              </CCardBody>
            </CCard>

            {/* Categories */}
            <CCard className="shadow-sm">
              <CCardBody>
                <h5 className="card-title">Categories</h5>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map((category, index) => (
                    <CButton key={index} color="outline-secondary" size="sm" className="mb-2">
                      {category}
                    </CButton>
                  ))}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

      {/* Footer */}
      <CFooter className="bg-dark text-white py-4 mt-5">
        <CContainer>
          <CRow>
            <CCol md={6}>
              <h5>MyBlog</h5>
              <p>Sharing knowledge and experiences in web development.</p>
            </CCol>
            <CCol md={3}>
              <h6>Quick Links</h6>
              <ul className="list-unstyled">
                <li>
                  <a href="#" className="text-white text-decoration-none">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white text-decoration-none">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white text-decoration-none">
                    Contact
                  </a>
                </li>
              </ul>
            </CCol>
            <CCol md={3}>
              <h6>Connect</h6>
              <ul className="list-unstyled">
                <li>
                  <a href="#" className="text-white text-decoration-none">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white text-decoration-none">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white text-decoration-none">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </CCol>
          </CRow>
          <hr className="my-4" />
          <div className="text-center">
            <small>&copy; 2024 MyBlog. All rights reserved.</small>
          </div>
        </CContainer>
      </CFooter>
    </div>
  )
}

export default BlogHome
