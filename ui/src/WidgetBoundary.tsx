import { Component, type ErrorInfo, type ReactNode } from 'react';

interface WidgetBoundaryProps {
  label: string;
  children: ReactNode;
  className?: string;
}

interface WidgetBoundaryState {
  hasError: boolean;
}

export class WidgetBoundary extends Component<WidgetBoundaryProps, WidgetBoundaryState> {
  state: WidgetBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WidgetBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Widget failed: ${this.props.label}`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={this.props.className}>
          <p className="activity-error" role="alert">
            couldn&apos;t load {this.props.label} right now.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

/** Runs `render` in this component so a thrown widget stays inside its boundary. */
export function WidgetContent({ render }: { render: () => ReactNode }) {
  return render();
}
