import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { UserContext } from "./UserContext";
import { FaShoppingCart, FaSearch } from "react-icons/fa";
import SearchOverlay from "./SearchOverlay";
import logo from "../assets/logo.png";

const CustomNavbar = () => {
  // Access user context and navigation hook
  const { user, isAdmin, logout } = useContext(UserContext);
  const navigate = useNavigate();

  // State for controlling search overlay visibility
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Logout handler: clear user context and redirect to login
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Styles for navigation links
  const navLinkStyle = {
    color: "white",
    textDecoration: "none",
  };

  const navLinkHoverStyle = {
    color: "#007bff",
  };

  // Navigate to cart page
  const cartPage = () => {
    navigate('/cart')
  }

  return (
    <>
      {/* Navbar with fixed positioning and black background */}
      <div style={{ padding: "3rem" }}>
        <Navbar bg="black" expand="lg" className="p-4 fixed-top navbar-dark">
          <Container>
            {/* Brand logo linking to home page */}
            <Navbar.Brand as={Link} to="/">
              <img src={logo} alt="logo" style={{ width: "70px" }} />
            </Navbar.Brand>
            
            {/* Responsive navbar toggle */}
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggler" />
            
            <Navbar.Collapse id="basic-navbar-nav">
              {/* Navigation links with hover effects */}
              <Nav className="mx-auto" style={{ gap: "1.5rem" }}>
                <Nav.Link
                  as={Link}
                  to="/beats"
                  style={navLinkStyle}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = navLinkHoverStyle.color)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color = navLinkStyle.color)
                  }
                >
                  Beats
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/about"
                  style={navLinkStyle}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = navLinkHoverStyle.color)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color = navLinkStyle.color)
                  }
                >
                  About
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/faq"
                  style={navLinkStyle}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = navLinkHoverStyle.color)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color = navLinkStyle.color)
                  }
                >
                  FAQ
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/contact"
                  style={navLinkStyle}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = navLinkHoverStyle.color)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color = navLinkStyle.color)
                  }
                >
                  Contact
                </Nav.Link>
                {user && isAdmin && (
  <Nav.Link
    as={Link}
    to="/admin-panel"
    style={navLinkStyle}
    className="text-gray-400"
    onMouseOver={(e) =>
      (e.currentTarget.style.color = navLinkHoverStyle.color)
    }
    onMouseOut={(e) =>
      (e.currentTarget.style.color = navLinkStyle.color)
    }
  >
    Admin Panel
  </Nav.Link>
)}
</Nav>

<div className="d-flex navIcons">
{user ? (
  <>
    <span className="text-white me-3">
      Welcome, {user.name}
    </span>
    <Button
      variant="outline-secondary"
      className="text-white"
      onClick={handleLogout}
      style={{ marginRight: "10px" }}
    >
      Logout
    </Button>
  </>
) : (
  <>
    <Link to="/login">
      <Button
        variant="outline-secondary"
        className="me-2 text-white"
      >
        Login
      </Button>
    </Link>
  </>
)}

<Button
  onClick={cartPage}
  variant="outline-secondary"
  className="me-2 text-white"
>
  <FaShoppingCart />
</Button>

<Button
  variant="outline-secondary"
  className="me-2 text-white"
  onClick={() => setIsSearchOpen(true)}
>
  <FaSearch />
</Button>
</div>
</Navbar.Collapse>
</Container>
</Navbar>
</div>

<SearchOverlay
isOpen={isSearchOpen}
onClose={() => setIsSearchOpen(false)}
/>
</>
);
};

export default CustomNavbar;
