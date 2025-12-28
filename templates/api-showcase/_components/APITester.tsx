"use client";

import { useState, useEffect, useCallback } from "react";

interface ParameterDoc {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  default?: string | number | boolean;
  enum?: string[];
  example?: string;
  min?: number;
  max?: number;
}

interface SchemaDoc {
  request?: ParameterDoc[];
  response?: ParameterDoc[];
  queryParams?: ParameterDoc[];
}

/** Example request from registry.json */
interface EndpointExample {
  description: string;
  query: string;
  curl: string;
}

/** State for each parameter in the interactive builder */
interface ParamState {
  enabled: boolean;
  value: string;
}

interface APITesterProps {
  id: string;
  endpoint: string;
  methods: string[];
  selectedEndpoint?: string | null;
  schemaPath?: string;
  schema?: SchemaDoc;
  /** Parameters from registry.json endpoints section */
  endpointParams?: ParameterDoc[];
  /** API route file path for reference */
  apiRoute?: string;
  /** Pre-built examples from registry.json */
  examples?: Record<string, EndpointExample>;
  /** Callback to expose submit function to parent */
  onSubmitRef?: (submitFn: () => Promise<void>) => void;
  /** Callback to notify parent of loading state */
  onLoadingChange?: (isLoading: boolean) => void;
}

interface RequestState {
  method: string;
  body: string;
  queryParams: string;
  headers: Record<string, string>;
}

interface ResponseState {
  status: number | null;
  statusText: string;
  body: string;
  time: number | null;
  error: string | null;
  contentType: string | null;
}

// Default request bodies for known APIs
const DEFAULT_BODIES: Record<string, Record<string, object>> = {
  brandfetch: {
    default: { domain: "stripe.com" },
  },
  elevenlabs: {
    tts: {
      text: "Hello, this is a test of the ElevenLabs text-to-speech API.",
      voiceId: "21m00Tcm4TlvDq8ikWAM",
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
      responseFormat: "json",
    },
    voices: {},
    models: {},
  },
};

// Default query params for GET requests
const DEFAULT_QUERY_PARAMS: Record<string, Record<string, string>> = {
  elevenlabs: {
    voices: "search=&pageSize=10",
    models: "",
  },
};

/**
 * API Tester Component
 *
 * Interactive form for testing API endpoints directly from the showcase.
 * Features:
 * - Method selection
 * - Schema-driven default values
 * - Query parameter support for GET requests
 * - JSON body editor
 * - Response display with timing
 * - Audio playback for binary responses
 *
 * Created with Hustle API Dev Tools (v3.12.12)
 */
export function APITester({
  id,
  endpoint,
  methods,
  selectedEndpoint,
  schemaPath,
  schema,
  endpointParams,
  apiRoute,
  examples,
  onSubmitRef,
  onLoadingChange,
}: APITesterProps) {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  // Interactive parameter builder state
  const [paramStates, setParamStates] = useState<Record<string, ParamState>>({});

  // Initialize param states from endpointParams
  const initializeParamStates = useCallback((params: ParameterDoc[] | undefined) => {
    if (!params) return {};
    const states: Record<string, ParamState> = {};
    for (const param of params) {
      // Default value: example > default > empty
      const defaultValue = param.example ||
        (param.default !== undefined ? String(param.default) : "") ||
        (param.enum?.[0] || "");

      // Required params are enabled by default
      states[param.name] = {
        enabled: param.required || false,
        value: defaultValue,
      };
    }
    return states;
  }, []);

  // Build query string from param states
  const buildQueryFromStates = useCallback((states: Record<string, ParamState>) => {
    const parts: string[] = [];
    for (const [name, state] of Object.entries(states)) {
      if (state.enabled && state.value) {
        parts.push(`${name}=${encodeURIComponent(state.value)}`);
      }
    }
    return parts.join("&");
  }, []);

  // Update param states from query string (for example buttons)
  const updateStatesFromQuery = useCallback((query: string, params: ParameterDoc[] | undefined) => {
    if (!params) return;
    const searchParams = new URLSearchParams(query);
    const newStates: Record<string, ParamState> = {};

    for (const param of params) {
      const value = searchParams.get(param.name);
      newStates[param.name] = {
        enabled: value !== null,
        value: value || param.example || (param.default !== undefined ? String(param.default) : "") || (param.enum?.[0] || ""),
      };
    }
    setParamStates(newStates);
  }, []);

  // Get default body for this API/endpoint
  const getDefaultBody = () => {
    const apiDefaults = DEFAULT_BODIES[id];
    if (apiDefaults) {
      const endpointDefaults = apiDefaults[selectedEndpoint || "default"];
      if (endpointDefaults && Object.keys(endpointDefaults).length > 0) {
        return JSON.stringify(endpointDefaults, null, 2);
      }
    }
    return JSON.stringify({}, null, 2);
  };

  // Get default query params for GET requests
  const getDefaultQueryParams = () => {
    // First check hardcoded defaults
    const apiParams = DEFAULT_QUERY_PARAMS[id];
    if (apiParams && selectedEndpoint) {
      return apiParams[selectedEndpoint] || "";
    }

    // Build from endpointParams if available
    if (endpointParams && endpointParams.length > 0) {
      const queryParts: string[] = [];
      for (const param of endpointParams) {
        if (param.name === "action") {
          // Add action with the selectedEndpoint or default value
          queryParts.push(`action=${selectedEndpoint || param.default || ""}`);
        } else if (param.required && param.example) {
          // Add required params with example values
          queryParts.push(`${param.name}=${encodeURIComponent(param.example)}`);
        } else if (param.required && param.default !== undefined) {
          // Add required params with defaults
          queryParts.push(`${param.name}=${encodeURIComponent(String(param.default))}`);
        }
      }
      return queryParts.join("&");
    }

    return "";
  };

  const [request, setRequest] = useState<RequestState>({
    method: methods[0] || "POST",
    body: getDefaultBody(),
    queryParams: getDefaultQueryParams(),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const [response, setResponse] = useState<ResponseState>({
    status: null,
    statusText: "",
    body: "",
    time: null,
    error: null,
    contentType: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Expose submit function to parent for footer button
  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef(handleSubmit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSubmitRef, request, endpoint]);

  // Notify parent of loading state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  // Update defaults when endpoint changes
  useEffect(() => {
    const queryParams = endpointParams || schema?.queryParams;
    const initialStates = initializeParamStates(queryParams);
    setParamStates(initialStates);

    setRequest((prev) => ({
      ...prev,
      method: methods[0] || "POST",
      body: getDefaultBody(),
      queryParams: buildQueryFromStates(initialStates),
    }));
    // Clear previous response and example selection
    setResponse({
      status: null,
      statusText: "",
      body: "",
      time: null,
      error: null,
      contentType: null,
    });
    setAudioUrl(null);
    setSelectedExample(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEndpoint, id, endpointParams, examples, schema]);

  // Auto-update query string when param states change
  useEffect(() => {
    if (Object.keys(paramStates).length > 0) {
      const newQuery = buildQueryFromStates(paramStates);
      setRequest((prev) => ({ ...prev, queryParams: newQuery }));
    }
  }, [paramStates, buildQueryFromStates]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setResponse({
      status: null,
      statusText: "",
      body: "",
      time: null,
      error: null,
      contentType: null,
    });
    setAudioUrl(null);

    const startTime = performance.now();

    try {
      // Build URL with query params for GET
      let url = endpoint;
      if (request.method === "GET" && request.queryParams.trim()) {
        url = `${endpoint}?${request.queryParams}`;
      }

      const fetchOptions: RequestInit = {
        method: request.method,
        headers: request.headers,
      };

      // Add body for non-GET requests
      if (request.method !== "GET" && request.body.trim()) {
        fetchOptions.body = request.body;
      }

      const res = await fetch(url, fetchOptions);
      const endTime = performance.now();

      const contentType = res.headers.get("content-type") || "";
      let responseBody = "";

      // Handle different content types
      if (
        contentType.includes("audio/") ||
        contentType.includes("application/octet-stream")
      ) {
        // Binary audio response
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        responseBody = `[Audio Response - ${blob.size} bytes]\nContent-Type: ${contentType}`;
      } else if (contentType.includes("application/json")) {
        const json = await res.json();
        responseBody = JSON.stringify(json, null, 2);

        // Check if JSON contains base64 audio
        if (json.audio && typeof json.audio === "string") {
          try {
            const format = json.format || "mp3";
            const audioData = atob(json.audio);
            const bytes = new Uint8Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
              bytes[i] = audioData.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: `audio/${format}` });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
          } catch {
            // Not valid base64, ignore
          }
        }
      } else {
        responseBody = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        body: responseBody,
        time: Math.round(endTime - startTime),
        error: null,
        contentType,
      });
    } catch (error) {
      const endTime = performance.now();
      setResponse({
        status: null,
        statusText: "",
        body: "",
        time: Math.round(endTime - startTime),
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        contentType: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: number | null) => {
    if (!status) return "text-gray-500";
    if (status >= 200 && status < 300) return "text-green-500";
    if (status >= 400 && status < 500) return "text-yellow-500";
    if (status >= 500) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Request Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-black dark:text-white">
          Request
        </h3>

        {/* Method Selection */}
        <div>
          <label className="mb-1 block text-sm font-bold text-black dark:text-white">
            Method
          </label>
          <div className="flex gap-2">
            {methods.map((method) => (
              <button
                key={method}
                onClick={() => setRequest((prev) => ({ ...prev, method }))}
                className={`border-2 px-4 py-2 text-sm font-medium transition-colors ${
                  request.method === method
                    ? "border-[#BA0C2F] bg-[#BA0C2F] text-white"
                    : "border-black bg-white text-black hover:border-[#BA0C2F] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Endpoint Display */}
        <div>
          <label className="mb-1 block text-sm font-bold text-black dark:text-white">
            Endpoint
          </label>
          <div className="flex items-center border-2 border-black bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
            <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
              {endpoint}
            </span>
          </div>
        </div>

        {/* Example Selector (for GET requests with examples) */}
        {request.method === "GET" && examples && Object.keys(examples).length > 0 && (
          <div>
            <label className="mb-1 block text-sm font-bold text-black dark:text-white">
              Example Requests
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(examples).map(([key, example]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedExample(key);
                    updateStatesFromQuery(example.query, endpointParams || schema?.queryParams);
                  }}
                  className={`border-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedExample === key
                      ? "border-[#BA0C2F] bg-[#BA0C2F] text-white"
                      : "border-black bg-white text-black hover:border-[#BA0C2F] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  }`}
                  title={example.description}
                >
                  {key.replace(/_/g, " ")}
                </button>
              ))}
            </div>
            {selectedExample && examples[selectedExample] && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {examples[selectedExample].description}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(examples[selectedExample].curl);
                  }}
                  className="shrink-0 border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  Copy curl
                </button>
              </div>
            )}
          </div>
        )}

        {/* Query Parameters (for GET requests) */}
        {request.method === "GET" && (
          <div>
            <label className="mb-1 block text-sm font-bold text-black dark:text-white">
              Query Parameters
            </label>
            <input
              type="text"
              value={request.queryParams}
              onChange={(e) => {
                setSelectedExample(null); // Clear example selection when manually editing
                setRequest((prev) => ({ ...prev, queryParams: e.target.value }));
              }}
              className="w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm focus:border-[#BA0C2F] focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="key1=value1&key2=value2"
            />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Add query string parameters (without the ?) - or select an example above
            </p>
          </div>
        )}

        {/* Body Editor (hide for GET) */}
        {request.method !== "GET" && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-bold text-black dark:text-white">
                Body (JSON)
              </label>
              <button
                onClick={() =>
                  setRequest((prev) => ({ ...prev, body: getDefaultBody() }))
                }
                className="text-xs text-gray-600 hover:text-[#BA0C2F] dark:text-gray-400"
              >
                Reset to defaults
              </button>
            </div>
            <textarea
              value={request.body}
              onChange={(e) =>
                setRequest((prev) => ({ ...prev, body: e.target.value }))
              }
              className="h-48 w-full border-2 border-black bg-white p-3 font-mono text-sm focus:border-[#BA0C2F] focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder='{"key": "value"}'
            />
          </div>
        )}

        {/* Interactive Parameter Builder (for GET requests with params) */}
        {request.method === "GET" && (endpointParams?.length || schema?.queryParams?.length) ? (
          <InteractiveParamBuilder
            params={endpointParams || schema?.queryParams || []}
            paramStates={paramStates}
            setParamStates={setParamStates}
          />
        ) : (
          /* Static Parameter Documentation (for non-GET requests) */
          (schema && schema.request?.length) ? (
            <ParameterDocs
              requestParams={schema?.request}
              isGetRequest={false}
            />
          ) : null
        )}

        {/* Headers */}
        <div>
          <label className="mb-1 block text-sm font-bold text-black dark:text-white">
            Headers
          </label>
          <div className="border-2 border-black bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
            {Object.entries(request.headers).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span className="font-bold text-black dark:text-white">
                  {key}:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            API keys loaded from .env automatically
          </p>
        </div>
      </div>

      {/* Response Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black dark:text-white">
            Response
          </h3>
          {response.time !== null && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {response.time}ms
            </span>
          )}
        </div>

        {/* Status */}
        {response.status !== null && (
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl font-bold ${getStatusColor(response.status)}`}
            >
              {response.status}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {response.statusText}
            </span>
          </div>
        )}

        {/* Error */}
        {response.error && (
          <div className="border-2 border-red-600 bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-300">
              {response.error}
            </p>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="border-2 border-black bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
            <p className="mb-2 text-sm font-bold text-black dark:text-white">
              Audio Response
            </p>
            <audio controls className="w-full" src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Body */}
        {response.body ? (
          <div className="relative">
            <pre className="max-h-96 overflow-auto border-2 border-black bg-zinc-900 p-4 text-sm text-zinc-100">
              <code>{response.body}</code>
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(response.body)}
              className="absolute right-2 top-2 border border-zinc-600 bg-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-600"
            >
              Copy
            </button>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center border-2 border-dashed border-black dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLoading
                ? "Waiting for response..."
                : "Send a request to see the response"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Interactive Parameter Builder Component
 * Allows users to check/uncheck params and edit values to build query strings.
 */
function InteractiveParamBuilder({
  params,
  paramStates,
  setParamStates,
}: {
  params: ParameterDoc[];
  paramStates: Record<string, ParamState>;
  setParamStates: React.Dispatch<React.SetStateAction<Record<string, ParamState>>>;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!params.length) return null;

  const handleToggle = (name: string) => {
    setParamStates((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        enabled: !prev[name]?.enabled,
      },
    }));
  };

  const handleValueChange = (name: string, value: string) => {
    setParamStates((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        enabled: true, // Auto-enable when value is changed
      },
    }));
  };

  return (
    <div className="border-2 border-black dark:border-gray-600">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between bg-gray-50 px-3 py-2 text-left dark:bg-gray-800"
      >
        <span className="text-sm font-bold text-black dark:text-white">
          Query Parameters Builder
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {params.map((param) => {
            const state = paramStates[param.name] || { enabled: false, value: "" };

            return (
              <div key={param.name} className="flex items-start gap-3 px-3 py-2">
                {/* Checkbox */}
                <label className="flex h-8 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={state.enabled}
                    onChange={() => handleToggle(param.name)}
                    disabled={param.required}
                    className="h-4 w-4 cursor-pointer accent-[#BA0C2F] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </label>

                {/* Parameter Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-sm font-bold text-[#BA0C2F]">
                      {param.name}
                    </code>
                    <span className="border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {param.type}
                    </span>
                    {param.required && (
                      <span className="border border-red-300 bg-red-50 px-1.5 py-0.5 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                        required
                      </span>
                    )}
                  </div>
                  {param.description && (
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                      {param.description}
                    </p>
                  )}
                </div>

                {/* Input Control */}
                <div className="w-36 shrink-0">
                  {param.enum ? (
                    /* Dropdown for enum types */
                    <select
                      value={state.value}
                      onChange={(e) => handleValueChange(param.name, e.target.value)}
                      className="w-full border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-[#BA0C2F] focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">-- none --</option>
                      {param.enum.map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  ) : param.type === "number" || param.type === "integer" ? (
                    /* Number input for numeric types */
                    <input
                      type="number"
                      value={state.value}
                      onChange={(e) => handleValueChange(param.name, e.target.value)}
                      min={param.min}
                      max={param.max}
                      placeholder={param.example || (param.default !== undefined ? String(param.default) : "")}
                      className="w-full border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-[#BA0C2F] focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  ) : (
                    /* Text input for string types */
                    <input
                      type="text"
                      value={state.value}
                      onChange={(e) => handleValueChange(param.name, e.target.value)}
                      placeholder={param.example || (param.default !== undefined ? String(param.default) : "")}
                      className="w-full border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-[#BA0C2F] focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Parameter Documentation Component
 * Displays request body documentation in a collapsible panel (for non-GET requests).
 */
function ParameterDocs({
  requestParams,
  isGetRequest,
}: {
  requestParams?: ParameterDoc[];
  isGetRequest: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!requestParams?.length) return null;

  return (
    <div className="border-2 border-black dark:border-gray-600">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between bg-gray-50 px-3 py-2 text-left dark:bg-gray-800"
      >
        <span className="text-sm font-bold text-black dark:text-white">
          Request Body Documentation
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {requestParams.map((param) => (
            <div key={param.name} className="px-3 py-2">
              <div className="flex items-center gap-2">
                <code className="text-sm font-bold text-[#BA0C2F]">
                  {param.name}
                </code>
                <span className="border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {param.type}
                </span>
                {param.required && (
                  <span className="border border-red-300 bg-red-50 px-1.5 py-0.5 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                    required
                  </span>
                )}
              </div>
              {param.description && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {param.description}
                </p>
              )}
              {param.enum && (
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">Options:</span>
                  {param.enum.map((val) => (
                    <code
                      key={val}
                      className="border border-gray-200 bg-gray-50 px-1 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {val}
                    </code>
                  ))}
                </div>
              )}
              {param.default !== undefined && (
                <p className="mt-1 text-xs text-gray-500">
                  Default:{" "}
                  <code className="text-gray-700 dark:text-gray-300">
                    {String(param.default)}
                  </code>
                </p>
              )}
              {param.example && (
                <p className="mt-1 text-xs text-gray-500">
                  Example:{" "}
                  <code className="text-gray-700 dark:text-gray-300">
                    {param.example}
                  </code>
                </p>
              )}
              {(param.min !== undefined || param.max !== undefined) && (
                <p className="mt-1 text-xs text-gray-500">
                  {param.min !== undefined && `Min: ${param.min}`}
                  {param.min !== undefined && param.max !== undefined && " · "}
                  {param.max !== undefined && `Max: ${param.max}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
