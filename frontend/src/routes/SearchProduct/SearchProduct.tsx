import { useSearchParams } from "react-router-dom";



const SearchProduct = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    return (
    <div>
      <h1>Search results for: {query}</h1>
    </div>
  );
}

export default SearchProduct;