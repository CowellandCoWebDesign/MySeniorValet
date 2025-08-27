import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple component for testing
const TestComponent = () => {
  return (
    <div>
      <h1>MySeniorValet Test</h1>
      <p>Testing infrastructure is working!</p>
      <button>Click Me</button>
    </div>
  );
};

describe('Simple Test Suite', () => {
  test('renders test component', () => {
    render(<TestComponent />);
    
    expect(screen.getByText('MySeniorValet Test')).toBeInTheDocument();
    expect(screen.getByText('Testing infrastructure is working!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  test('basic math operations work', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 3).toBe(9);
    expect(8 / 2).toBe(4);
  });

  test('array operations work', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
    expect([...arr, 4]).toEqual([1, 2, 3, 4]);
  });

  test('string operations work', () => {
    const str = 'MySeniorValet';
    expect(str).toMatch(/Senior/);
    expect(str.toLowerCase()).toBe('myseniorvalet');
    expect(str).toHaveLength(13);
  });

  test('object operations work', () => {
    const obj = { name: 'Test', value: 100 };
    expect(obj).toHaveProperty('name');
    expect(obj.value).toBeGreaterThan(50);
    expect({ ...obj, active: true }).toEqual({ name: 'Test', value: 100, active: true });
  });
});