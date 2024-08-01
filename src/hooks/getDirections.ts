import { useState } from "react";
import axios from "axios";
import type {
  OpenAIResponse,
  SearchResult,
  ProcessedData,
  DirectionsResponse,
} from "./types";

const getDirections = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchParams, setSearchParams] = useState<ProcessedData | null>(null);

  const allowedItems = {
    cities: ["Amsterdam"],
    keywords: [
      "Event_Venue",
      "Function_Room_Facility",
      "Office_Space_Rental_Agency",
      "Pub",
      "Recording_Studio",
      "Cheese_Shop",
      "Deli",
      "Live_Music_Bar",
      "Bar",
      "Cafe",
      "Piano_Bar",
      "Restaurant",
      "Cocktail_Bar",
      "Entertainer",
      "Wi-Fi_Spot",
      "Wine_Bar",
      "Museum",
      "Art_Museum",
      "Cultural_Center",
      "Modern_Art_Museum",
      "Tourist_Attraction",
      "Barbecue_Restaurant",
      "Egyptian_Restaurant",
      "Hotel",
    ],
    nodeTypes: ["City", "Hotel", "Import", "Keyword"],
  };

  const processSearch = async (searchTerm: string) => {
    setLoading(true);
    setError(null);

    const parseOpenAIResponse = (data: OpenAIResponse): ProcessedData => {
      const functionCall = data.choices[0].message.function_call;
      if (functionCall?.arguments) {
        const args = JSON.parse(functionCall.arguments);
        const keywords = args.keywords.filter((kw: string) =>
          allowedItems.keywords.includes(kw)
        );
        const nodeTypes = args.nodeTypes.filter((nt: string) =>
          allowedItems.nodeTypes.includes(nt)
        );
        const city = allowedItems.cities.includes(args.city) ? args.city : "";
        return {
          search: args.search,
          keywords,
          nodeTypes,
          city,
          limit: args.limit,
          offset: args.offset,
        };
      }
      return {
        search: "",
        keywords: [],
        nodeTypes: [],
        city: "",
        limit: 10,
        offset: 0,
      };
    };

    try {
      // Call OpenAI API to process the search string
      const apiUrl = "https://api.openai.com/v1/chat/completions";
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };

      const requestBody = {
        model: "gpt-4o-mini", // Use the appropriate model
        messages: [
          {
            role: "user",
            content: `Convert the following search string to the closest match of the allowed items. Here are the allowed items:
              Keywords: ${allowedItems.keywords.join(", ")}
              Node Types: ${allowedItems.nodeTypes.join(", ")}
              Cities: ${allowedItems.cities.join(", ")}
              Search String: "${searchTerm}"`,
          },
        ],
        functions: [
          {
            name: "set_search_parameters",
            description: "Sets the search parameters for the directions API",
            parameters: {
              type: "object",
              properties: {
                search: { type: "string" },
                keywords: { type: "array", items: { type: "string" } },
                nodeTypes: { type: "array", items: { type: "string" } },
                city: { type: "string" },
                limit: { type: "number" },
                offset: { type: "number" },
              },
              required: [
                "search",
                "keywords",
                "nodeTypes",
                "city",
                "limit",
                "offset",
              ],
            },
          },
        ],
        function_call: "auto",
        max_tokens: 550,
      };

      const { data } = await axios.post<OpenAIResponse>(apiUrl, requestBody, {
        headers,
      });

      const searchQueryObject = parseOpenAIResponse(data);
      setSearchParams(searchQueryObject);

      // Make the request to the directions API
      const directionsResponse = await axios.post<DirectionsResponse>(
        "https://api.directions.app/v1.0/graph/search",
        searchQueryObject
      );

      setResults(directionsResponse.data.results);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  return { processSearch, results, loading, error, searchParams };
};

export default getDirections;
