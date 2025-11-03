import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import './index.css'

const apiStatusConstants = {
  INITIAL: 'INITIAL',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  NO_JOBS: 'NO_JOBS',
}

function Jobs({employmentTypesList, salaryRangesList}) {
  const history = useHistory()
  const [profile, setProfile] = useState({})
  const [profileStatus, setProfileStatus] = useState(apiStatusConstants.INITIAL)
  const [jobs, setJobs] = useState([])
  const [jobsStatus, setJobsStatus] = useState(apiStatusConstants.INITIAL)
  const [employmentType, setEmploymentType] = useState([])
  const [salaryRange, setSalaryRange] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Fetch Profile
  const getProfile = async () => {
    setProfileStatus(apiStatusConstants.LOADING)
    const jwtToken = Cookies.get('jwt_token')
    try {
      const response = await fetch('https://apis.ccbp.in/profile', {
        headers: {Authorization: `Bearer ${jwtToken}`},
      })
      if (response.ok) {
        const data = await response.json()
        setProfile({
          name: data.profile_details.name,
          profileImageUrl: data.profile_details.profile_image_url,
          shortBio: data.profile_details.short_bio,
        })
        setProfileStatus(apiStatusConstants.SUCCESS)
      } else {
        setProfileStatus(apiStatusConstants.FAILURE)
      }
    } catch {
      setProfileStatus(apiStatusConstants.FAILURE)
    }
  }

  // Fetch Jobs
  const getJobs = async (
    employmentParam = employmentType.join(','),
    salaryParam = salaryRange,
    searchParam = searchInput,
  ) => {
    setJobsStatus(apiStatusConstants.LOADING)
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentParam}&minimum_package=${salaryParam}&search=${searchParam}`

    try {
      const response = await fetch(apiUrl, {
        headers: {Authorization: `Bearer ${jwtToken}`},
      })
      if (response.ok) {
        const data = await response.json()
        if (data.jobs.length === 0) {
          setJobs([])
          setJobsStatus(apiStatusConstants.NO_JOBS)
        } else {
          const updatedJobs = data.jobs.map(job => ({
            id: job.id,
            title: job.title,
            companyLogoUrl: job.company_logo_url,
            employmentType: job.employment_type,
            location: job.location,
            packagePerAnnum: job.package_per_annum,
            rating: job.rating,
            jobDescription: job.job_description,
          }))
          setJobs(updatedJobs)
          setJobsStatus(apiStatusConstants.SUCCESS)
        }
      } else {
        setJobsStatus(apiStatusConstants.FAILURE)
      }
    } catch {
      setJobsStatus(apiStatusConstants.FAILURE)
    }
  }

  // Run on component mount only
  useEffect(() => {
    getProfile()
    getJobs()
  }, [])

  // Retry handlers
  const onRetryProfile = () => getProfile()
  const onRetryJobs = () => getJobs()

  // Filter handlers
  const onChangeEmploymentType = id => {
    const updatedTypes = employmentType.includes(id)
      ? employmentType.filter(type => type !== id)
      : [...employmentType, id]
    setEmploymentType(updatedTypes)
    getJobs(updatedTypes, salaryRange, searchInput)
  }

  const onChangeSalaryRange = id => {
    setSalaryRange(id)
    getJobs(employmentType, id, searchInput)
  }

  const onChangeSearchInput = e => setSearchInput(e.target.value)
  const onClickSearch = () => getJobs(employmentType, salaryRange, searchInput)

  // Render Profile
  const renderProfile = () => {
    switch (profileStatus) {
      case apiStatusConstants.LOADING:
        return (
          <div data-testid="loader" className="loader-container">
            <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
          </div>
        )
      case apiStatusConstants.SUCCESS:
        return (
          <div className="profile-container">
            <img src={profile.profileImageUrl} alt="profile" />
            <h1>{profile.name}</h1>
            <p>{profile.shortBio}</p>
          </div>
        )
      case apiStatusConstants.FAILURE:
        return (
          <div className="failure-view">
            <button
              type="button"
              data-testid="retryProfileButton"
              onClick={onRetryProfile}
            >
              Retry
            </button>
          </div>
        )
      default:
        return null
    }
  }

  // Render Jobs
  const renderJobs = () => {
    switch (jobsStatus) {
      case apiStatusConstants.LOADING:
        return (
          <div data-testid="loader" className="loader-container">
            <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
          </div>
        )
      case apiStatusConstants.SUCCESS:
        return (
          <ul className="jobs-list">
            {jobs.map(job => (
              <li
                key={job.id}
                className="job-item"
                onClick={() => history.push(`/jobs/${job.id}`)}
              >
                <img src={job.companyLogoUrl} alt="company logo" />
                <h2>{job.title}</h2>
                <p>⭐ {job.rating}</p>
                <p>{job.location}</p>
                <p>{job.employmentType}</p>
                <p>{job.packagePerAnnum}</p>
                <hr />
                <h2>Description</h2>
                <p data-testid="jobDescription">{job.jobDescription}</p>
              </li>
            ))}
          </ul>
        )
      case apiStatusConstants.NO_JOBS:
        return (
          <div className="no-jobs-view">
            <img
              src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
              alt="no jobs"
            />
            <h1>No Jobs Found</h1>
            <p>We could not find any jobs. Try other filters.</p>
          </div>
        )
      case apiStatusConstants.FAILURE:
        return (
          <div className="failure-view">
            <img
              src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
              alt="failure view"
            />
            <h1>Oops! Something Went Wrong</h1>
            <p>We cannot seem to find the page you are looking for</p>
            <button
              type="button"
              data-testid="retryJobsButton"
              onClick={onRetryJobs}
            >
              Retry
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Header />
      <div className="jobs-route-container">
        <div className="profile-section">
          {renderProfile()}
          <div className="filters-section">
            <h1>Type of Employment</h1>
            <ul>
              {employmentTypesList.map(type => (
                <label key={type.employmentTypeId}>
                  <input
                    type="checkbox"
                    value={type.employmentTypeId}
                    checked={employmentType.includes(type.employmentTypeId)}
                    onChange={() =>
                      onChangeEmploymentType(type.employmentTypeId)
                    }
                  />
                  {type.label}
                </label>
              ))}
            </ul>
            <h1>Salary Range</h1>
            <ul>
              {salaryRangesList.map(range => (
                <label key={range.salaryRangeId}>
                  <input
                    type="radio"
                    name="salary"
                    value={range.salaryRangeId}
                    checked={salaryRange === range.salaryRangeId}
                    onChange={() => onChangeSalaryRange(range.salaryRangeId)}
                  />
                  {range.label}
                </label>
              ))}
            </ul>
          </div>
        </div>
        <div className="jobs-section">
          <div className="search-container">
            <input
              type="search"
              value={searchInput}
              onChange={onChangeSearchInput}
              placeholder="Search"
            />
            <button
              data-testid="searchButton"
              type="button"
              onClick={onClickSearch}
            >
              Search
            </button>
          </div>
          {renderJobs()}
        </div>
      </div>
    </>
  )
}

export default Jobs
