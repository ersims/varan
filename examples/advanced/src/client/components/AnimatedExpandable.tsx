// Dependencies
import * as React from 'react';

// Types
interface AnimatedExpandableProps {
  isOpen?: boolean;
  duration?: number;
  type?: 'ease-in-out' | 'linear';
  className?: string;
  children?: React.ReactNode;
}
interface AnimatedExpandableState {
  toHeight: number;
}

class AnimatedExpandable extends React.PureComponent<AnimatedExpandableProps> {
  public static defaultProps: Partial<AnimatedExpandableProps> = {
    isOpen: false,
    duration: 250,
    type: 'ease-in-out',
  };
  public state = {
    toHeight: 0,
  };
  protected ref: HTMLDivElement | null = null;
  protected timer: number | null = null;

  // Trigger animation
  public componentWillReceiveProps(nextProps: AnimatedExpandableProps) {
    // Opening
    if (nextProps.isOpen && !this.props.isOpen) {
      if (this.ref) {
        const expectedHeight = this.ref.getBoundingClientRect().height;
        this.setState({ toHeight: expectedHeight });
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.setState({ toHeight: 'auto' }), nextProps.duration);
      } else this.setState({ toHeight: 'auto' });
    }

    // Closing
    else if (!nextProps.isOpen) {
      if (this.ref) {
        const currentHeight = this.ref.getBoundingClientRect().height;
        if (this.timer) clearTimeout(this.timer);
        this.setState({ toHeight: currentHeight }, () => {
          this.timer = setTimeout(() => {
            this.setState({ toHeight: 0 });
          }, (1000 / 60) * 2.1) as any;
        });
      } else this.setState({ toHeight: 0 });
    }
  }

  // Cleanup
  public componentWillUnmount() {
    if (this.timer) clearTimeout(this.timer);
  }
  public render() {
    const { children, duration, type, className } = this.props;
    const { toHeight } = this.state;
    return (
      <div
        style={{
          height: toHeight,
          transition: `height ${duration}ms ${type}`,
          overflow: 'hidden',
        }}
        className={className}
      >
        <div
          ref={ref => {
            this.ref = ref;
          }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </div>
      </div>
    );
  }
}

export default AnimatedExpandable;
