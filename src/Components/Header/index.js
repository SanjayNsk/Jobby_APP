import {Link, useHistory} from 'react-router-dom'
import Cookies from 'js-cookie'
import './index.css'

function Header() {
  const history = useHistory()

  const onLogout = () => {
    Cookies.remove('jwt_token')
    history.replace('/login') // Redirect to login
  }

  return (
    <nav className="nav-header">
      {/* Logo wrapped in Link */}
      <Link to="/">
        <img
          src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
          alt="website logo"
          className="website-logo"
        />
      </Link>

      {/* Navigation items */}
      <ul className="nav-list">
        <li>
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>
        <li>
          <Link to="/jobs" className="nav-link">
            Jobs
          </Link>
        </li>
      </ul>

      {/* Logout button */}
      <button type="button" onClick={onLogout} className="logout-button">
        Logout
      </button>
    </nav>
  )
}

export default Header
