"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-destructive/10">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Something went wrong</h2>
                <p className="text-muted-foreground">
                  We encountered an unexpected error. Your work has been saved, and you can try refreshing the page.
                </p>
              </div>

              {this.state.error && process.env.NODE_ENV === "development" && (
                <div className="w-full p-4 bg-muted rounded-md text-left">
                  <p className="text-sm font-mono text-xs break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={this.handleReset} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

