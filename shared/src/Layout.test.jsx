import { render, screen, fireEvent } from "@testing-library/react";
import Layout from "./Layout";

const ChildComponent = ({ search, category, price }) => (
  <div>
    <p>Search: {search}</p>
    <p>Category: {category}</p>
    <p>Price: {price}</p>
  </div>
);

jest.mock("./components/Navbar", () => (props) => (
  <div>
    <button onClick={() => props.onSearch("watch")}>Search</button>
    <button onClick={() => props.onFilter("Men")}>Filter</button>
    <button onClick={() => props.onPriceChange(1500)}>Price</button>
  </div>
));

jest.mock("./components/Footer", () => () => <div>Footer</div>);

const mockUseLocation = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => mockUseLocation(),
}));

describe("Layout Component", () => {
  test("renders children and footer correctly", () => {
    mockUseLocation.mockReturnValue({ pathname: "/" });

    render(
      <Layout>
        <div>Child Content</div>
      </Layout>
    );

    expect(screen.getByText("Child Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  test("updates children when Navbar triggers callbacks", () => {
    mockUseLocation.mockReturnValue({ pathname: "/" });

    render(
      <Layout>
        {({ search, category, price }) => (
          <ChildComponent search={search} category={category} price={price} />
        )}
      </Layout>
    );

    fireEvent.click(screen.getByText("Search"));
    fireEvent.click(screen.getByText("Filter"));
    fireEvent.click(screen.getByText("Price"));

    expect(screen.getByText("Search: watch")).toBeInTheDocument();
    expect(screen.getByText("Category: Men")).toBeInTheDocument();
    expect(screen.getByText("Price: 1500")).toBeInTheDocument();
  });

  test("hides footer on /login and /signup routes", () => {
   
    mockUseLocation.mockReturnValue({ pathname: "/login" });
    const { rerender } = render(<Layout><div>Login Page</div></Layout>);
    expect(screen.queryByText("Footer")).not.toBeInTheDocument();

    mockUseLocation.mockReturnValue({ pathname: "/signup" });
    rerender(<Layout><div>Signup Page</div></Layout>);
    expect(screen.queryByText("Footer")).not.toBeInTheDocument();
  });
});
