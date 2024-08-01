import type React from "react";
import { useState, useEffect } from "react";
import SearchIcon from "assets/icons/compass.svg";
import LoadingIcon from "assets/icons/loading.svg";
import useUnsplashImages from "hooks/getImages";
import useUserLocation from "hooks/getLocation"; // Import the custom hook
import getDirections from "hooks/getDirections";
import type { SearchResult } from "hooks/types"; // Import the SearchResult type
import "./app.css"; // Add any custom CSS for Masonry here

const App: React.FC = () => {
  const { location, error: locationError } = useUserLocation(); // Use the custom hook
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const {
    images,
    loading: imagesLoading,
    error: imagesError,
  } = useUnsplashImages(location || "nature");
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [paddingPixel, setPaddingPixel] = useState<number>(
    window.innerHeight * 0.3
  );

  const { processSearch, results, loading, error, searchParams } =
    getDirections(); // Use the custom hook

  useEffect(() => {
    if (location) {
      setSearchTerm(location);
      setSearchQuery(location);
    }
  }, [location]);

  useEffect(() => {
    if (images.length > 0) {
      setBackgroundImage(images[0].urls.full);
    }
  }, [images]);

  useEffect(() => {
    const handleResize = () => {
      setPaddingPixel(window.innerHeight * 0.3);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async () => {
    await processSearch(searchTerm);
    setSearchQuery(searchTerm);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleSearch();
    }
  };

  const breakpointColumnsObj = {
    default: 3,
    1400: 3,
    900: 2,
    500: 1,
  };

  return (
    <main
      className="relative min-h-screen bg-cover bg-center "
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5) 20%, rgba(0,0,0,1) 40%), url(${backgroundImage})`,
      }}
    >
      <header
        className="relative z-10 max-w-[1700px] flex flex-col items-center justify-center mx-auto"
        style={{ paddingTop: `${paddingPixel}px` }}
      >
        <div className="flex justify-center mb-8 max-w-screen-lg w-full ">
          <div className="relative w-full flex items-center px-8">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder="Search for inspiration..."
              className="p-2 w-full text-xl rounded-l-full rounded-r-full text-gray"
            />
            <button
              type="button"
              className="absolute right-8 p-2 text-xl rounded-r-full flex items-center justify-center h-full w-9 text-brandblue hover:text-brandgold"
              onClick={handleSearch}
            >
              {loading ? <LoadingIcon /> : <SearchIcon />}
            </button>
          </div>
        </div>
        <div className="search-params text-white mb-8">
          <p>
            <strong>City:</strong> {searchParams?.city || "Any"}
          </p>
          <p>
            <strong>Node Types:</strong> {searchParams?.nodeTypes.join(", ")}
          </p>
          <p>
            <strong>Keywords:</strong> {searchParams?.keywords.join(", ")}
          </p>
        </div>

        <div className="results">
          {results.map((result: SearchResult) => (
            <div key={result.id} className="result-item">
              <h3>{result.name}</h3>
              <p>{result.description}</p>
              <a href={result.link} target="_blank" rel="noopener noreferrer">
                <img src={result.image} alt={result.name} />
              </a>
              <p>Type: {result.nodeType}</p>
            </div>
          ))}
        </div>
      </header>
    </main>
  );
};

export default App;
