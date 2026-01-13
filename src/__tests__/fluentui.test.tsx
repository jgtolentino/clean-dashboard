import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import { Button } from '@fluentui/react-components';

describe('FluentUI Integration', () => {
  it('renders FluentUI button', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Test Button');
  });

  it('button is interactive', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
