// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';

// mock the intersection observer and just say everything is in view
const mockIntersectionObserver = jest.fn().mockImplementation((arg) => ({
  observe: jest.fn().mockImplementation((elem) => {
    arg([{ target: elem, isIntersecting: true }]);
  }),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = mockIntersectionObserver;
