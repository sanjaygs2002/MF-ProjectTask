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

describe("Layout Component", () => {
  test("renders children correctly", () => {
    render(
      <Layout>
        <div>Child Content</div>
      </Layout>
    );
    expect(screen.getByText("Child Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  test("calls onSearch, onFilter, onPriceChange callbacks", () => {
    const onSearchMock = jest.fn();
    const onFilterMock = jest.fn();
    const onPriceChangeMock = jest.fn();

    render(
      <Layout
        onSearch={onSearchMock}
        onFilter={onFilterMock}
        onPriceChange={onPriceChangeMock}
      >
        {({ search, category, price }) => (
          <ChildComponent search={search} category={category} price={price} />
        )}
      </Layout>
    );

    
    fireEvent.click(screen.getByText("Search"));
    fireEvent.click(screen.getByText("Filter"));
    fireEvent.click(screen.getByText("Price"));

    
    expect(onSearchMock).toHaveBeenCalledWith("watch");
    expect(onFilterMock).toHaveBeenCalledWith("Men");
    expect(onPriceChangeMock).toHaveBeenCalledWith(1500);
    

    // Check if children render updated values
    expect(screen.getByText("Search: watch")).toBeInTheDocument();
    expect(screen.getByText("Category: Men")).toBeInTheDocument();
    expect(screen.getByText("Price: 1500")).toBeInTheDocument();
  });
});
