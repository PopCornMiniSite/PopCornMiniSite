import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'

class ErrorBoundaryInner extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(229,9,20,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>{t('common.error')}</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px', maxWidth: '300px' }}>{this.state.error?.message}</p>
          <button onClick={this.resetError} style={{
            backgroundColor: '#E50914', color: '#fff', fontWeight: 600,
            padding: '12px 24px', borderRadius: '12px', border: 'none',
            fontSize: '14px', cursor: 'pointer',
          }}>
            {t('common.retry')}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const ErrorBoundary = withTranslation()(ErrorBoundaryInner)
export default ErrorBoundary
