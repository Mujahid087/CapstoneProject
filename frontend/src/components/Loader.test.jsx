import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Loader from "./Loader";

// Mock react-bootstrap Spinner
jest.mock("react-bootstrap", () => ({
  Spinner: (props) => <div data-testid="spinner" {...props} />,
}));

describe("Loader Component", () => {
  it("renders without crashing", () => {
    render(<Loader />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("uses danger variant for the spinner", () => {
    render(<Loader />);
    const spinner = screen.getByTestId("spinner");
    expect(spinner).toHaveAttribute("variant", "danger");
  });

  it("has centered layout classes", () => {
    const { container } = render(<Loader />);
    const wrapper = container.firstChild;
    expect(wrapper.className).toContain("d-flex");
    expect(wrapper.className).toContain("justify-content-center");
    expect(wrapper.className).toContain("align-items-center");
  });
});
