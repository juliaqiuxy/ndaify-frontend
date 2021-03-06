import openApiSnippet from 'openapi-snippet';

import loggerClient from '../db/loggerClient';

// https://github.com/Kong/httpsnippet/pull/154
// https://github.com/github/linguist/blob/master/lib/linguist/popular.yml
// https://github.com/ErikWittern/openapi-snippet
const SNIPPET_TO_LINGUIST = {
  c_libcurl: 'C',
  csharp_restsharp: 'C#',
  go_native: 'Go',
  java_okhttp: 'Java',
  java_unirest: 'Java',
  javascript_jquery: 'JavaScript',
  javascript_xhr: 'JavaScript',
  node_native: 'JavaScript',
  node_request: 'JavaScript',
  node_unirest: 'JavaScript',
  objc_nsurlsession: 'Objective-C',
  ocaml_cohttp: 'Haskell',
  php_curl: 'PHP',
  php_http1: 'PHP',
  php_http2: 'PHP',
  python_python3: 'Python',
  python_requests: 'Python',
  ruby_native: 'Ruby',
  shell_curl: 'Shell',
  shell_httpie: 'Shell',
  shell_wget: 'Shell',
  swift_nsurlsession: 'Swift',
};

const SNIPPET_TO_PREFERRED_LABELS = {
  go_native: 'Go',
  node_native: 'JavaScript',
  shell_curl: 'cURL',
  php_http2: 'PHP',
};

const getCodeSamples = (openApiSpec, pathKey, methodKey, values) => {
  try {
    const results = openApiSnippet.getEndpointSnippets(
      openApiSpec,
      pathKey,
      methodKey,
      ['shell_curl', 'node_native', 'go_native', 'php_http2'],
    );

    // "snippets": [
    //   {
    //       "id": "shell_curl",
    //       "title": "Shell + Curl",
    //       "content": "curl --request POST \\\n  --url https://api.ndaify.com/events/stripe \\\n  --header 'content-type: */*'"
    //   }
    // ]
    return results.snippets.map((snippet) => ({
      lang: SNIPPET_TO_LINGUIST[snippet.id],
      label: SNIPPET_TO_PREFERRED_LABELS[snippet.id] || snippet.title,
      source: decodeURIComponent(snippet.content).replace('REPLACE_KEY_VALUE', `ApiKey ${values.apiToken}`),
    }));
  } catch (error) {
    loggerClient.error(error);
  }

  return [];
};

const enhanceMethods = (openApiSpec, pathKey, methods, values) => {
  const methodKeys = Object.keys(methods);

  return methodKeys.reduce((accum, methodKey) => {
    const methodValue = methods[methodKey];
    return {
      ...accum,
      [methodKey]: {
        ...methodValue,
        'x-code-samples': getCodeSamples(openApiSpec, pathKey, methodKey, values),
      },
    };
  }, {});
};

const enhancePaths = (openApiSpec, paths, values) => {
  const pathKeys = Object.keys(paths);

  return pathKeys.reduce((accum, pathKey) => {
    const methods = paths[pathKey];
    return {
      ...accum,
      [pathKey]: enhanceMethods(openApiSpec, pathKey, methods, values),
    };
  }, {});
};

const enhanceOpenApiSpec = (openApiSpec, values) => {
  const spec = {
    ...openApiSpec,
    servers: [
      {
        url: process.env.NDAIFY_ENDPOINT_URL,
      },
    ],
    paths: enhancePaths(openApiSpec, openApiSpec.paths, values),
  };

  return spec;
};

export default enhanceOpenApiSpec;
