import { Component } from 'react'
import { Button } from '@/components/ui/button'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[GoToTrip] Uncaught error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-6 py-16 text-left">
          <h1 className="font-serif text-3xl text-foreground">
            Something went wrong
          </h1>
          <p className="mt-3 text-muted">
            We hit an unexpected error. You can return home and try again.
          </p>
          {import.meta.env.DEV && this.state.error?.message ? (
            <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-surface p-4 text-xs text-muted">
              {this.state.error.message}
            </pre>
          ) : null}
          <div className="mt-8">
            <Button type="button" onClick={this.handleReset}>
              Back to home
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
