import {useState, useEffect} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import './index.css'

const apiStatusConstants = {
  INITIAL: 'INITIAL',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
}

// Small component to render loader
const LoaderView = () => (
  <div data-testid="loader" className="loader-container">
    <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
  </div>
)

// Small component to render failure
const FailureView = ({onRetry}) => (
  <div className="failure-view">
    <img
      src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
      alt="failure view"
    />
    <h1>Oops! Something Went Wrong</h1>
    <p>We cannot seem to find the page you are looking for</p>
    <button type="button" onClick={onRetry}>
      Retry
    </button>
  </div>
)

// Component for rendering each similar job
const SimilarJobItem = ({job, onViewDetails}) => (
  <li className="job-item">
    <img src={job.companyLogoUrl} alt="similar job company logo" />
    <h3>{job.title}</h3>
    <p>⭐ {job.rating}</p>
    <h4>Description</h4>
    <p>{job.jobDescription}</p>
    <p>{job.location}</p>
    <p>{job.employmentType}</p>
    <button type="button" onClick={onViewDetails}>
      View Details
    </button>
  </li>
)

function JobItemDetails() {
  const {id} = useParams()
  const history = useHistory()
  const [jobDetails, setJobDetails] = useState(null)
  const [similarJobs, setSimilarJobs] = useState([])
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.INITIAL)

  const getJobDetails = async () => {
    setApiStatus(apiStatusConstants.LOADING)
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs/${id}`

    try {
      const response = await fetch(apiUrl, {
        headers: {Authorization: `Bearer ${jwtToken}`},
      })
      if (response.ok) {
        const data = await response.json()
        const updatedJob = {
          id: data.job_details.id,
          title: data.job_details.title,
          companyLogoUrl: data.job_details.company_logo_url,
          companyWebsiteUrl: data.job_details.company_website_url,
          employmentType: data.job_details.employment_type,
          location: data.job_details.location,
          packagePerAnnum: data.job_details.package_per_annum,
          rating: data.job_details.rating,
          jobDescription: data.job_details.job_description,
          lifeAtCompany: data.job_details.life_at_company,
          skills: data.job_details.skills,
        }
        const updatedSimilarJobs = data.similar_jobs.map(job => ({
          id: job.id,
          title: job.title,
          companyLogoUrl: job.company_logo_url,
          location: job.location,
          employmentType: job.employment_type,
          rating: job.rating,
          jobDescription: job.job_description,
        }))
        setJobDetails(updatedJob)
        setSimilarJobs(updatedSimilarJobs)
        setApiStatus(apiStatusConstants.SUCCESS)
      } else {
        setApiStatus(apiStatusConstants.FAILURE)
      }
    } catch {
      setApiStatus(apiStatusConstants.FAILURE)
    }
  }

  useEffect(() => {
    getJobDetails()
  }, [id]) // fixed dependency issue

  const onRetry = () => getJobDetails()

  const renderJobDetails = () => (
    <div className="job-details-container">
      {/* Job Header */}
      <div className="job-main">
        <img
          src={jobDetails.companyLogoUrl}
          alt="job details company logo"
          className="company-logo"
        />
        <div className="job-header">
          <h1>{jobDetails.title}</h1>
          <p>⭐ {jobDetails.rating}</p>
        </div>
        <p>{jobDetails.location}</p>
        <p>{jobDetails.employmentType}</p>
        <p>{jobDetails.packagePerAnnum}</p>
        <a
          href={jobDetails.companyWebsiteUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit
        </a>
      </div>

      <hr />

      {/* Job Description */}
      <h1>Description</h1>
      <p>{jobDetails.jobDescription}</p>

      {/* Skills */}
      <h1>Skills</h1>
      <ul className="skills-list">
        {jobDetails.skills.map(skill => (
          <li key={skill.name} className="skill-item">
            <img src={skill.image_url} alt={skill.name} />
            <p>{skill.name}</p>
          </li>
        ))}
      </ul>

      {/* Life at Company */}
      <h1>Life at Company</h1>
      <p>{jobDetails.lifeAtCompany.description}</p>
      <img
        src={jobDetails.lifeAtCompany.image_url}
        alt="life at company"
        className="life-image"
      />

      <hr />

      {/* Similar Jobs */}
      <h1>Similar Jobs</h1>
      <ul className="similar-jobs-list">
        {similarJobs.map(job => (
          <SimilarJobItem
            key={job.id}
            job={job}
            onViewDetails={() => history.push(`/jobs/${job.id}`)}
          />
        ))}
      </ul>
    </div>
  )

  const renderContent = () => {
    switch (apiStatus) {
      case apiStatusConstants.LOADING:
        return <LoaderView />
      case apiStatusConstants.SUCCESS:
        return renderJobDetails()
      case apiStatusConstants.FAILURE:
        return <FailureView onRetry={onRetry} />
      default:
        return null
    }
  }

  return (
    <>
      <Header />
      <div className="job-item-details-route">{renderContent()}</div>
    </>
  )
}

export default JobItemDetails
