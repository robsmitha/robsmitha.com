// Define a string literal union type for all available devicon values
export type DeviconValue = 
  | 'amazonwebservices-original'
  | 'csharp-original'
  | 'javascript-plain'
  | 'css3-original-wordmark'
  | 'html5-original-wordmark'
  | 'typescript-original'
  | 'devicon-original-wordmark'
  | 'linux-original'
  | 'bootstrap-plain-wordmark'
  | 'dot-net-original-wordmark'
  | 'dot-net-plain'
  | 'angularjs-plain'
  | 'react-original'
  | 'android-original'
  | 'yarn-original'
  | 'vuejs-original'
  | 'google-original';

// Define technology keys as a string literal union type
export type TechnologyKey = 
  | 'c#'
  | 'javascript'
  | 'css'
  | 'html'
  | 'typescript'
  | 'aws-sdk-net'
  | 'linux'
  | 'bootstrap'
  | 'aspnetcore'
  | 'angular'
  | 'react'
  | 'react-stripe-elements'
  | 'vue'
  | 'cli'
  | 'vuetify'
  | 'yarn'
  | 'grpc'
  | 'clover-android-sdk';

// Export constants with proper typing
export const DeviconAmazonWebServicesOriginal: DeviconValue = 'amazonwebservices-original';
export const DeviconCSharpOriginal: DeviconValue = 'csharp-original';
export const DeviconJavaScriptPlain: DeviconValue = 'javascript-plain';
export const DeviconCSS3WordMark: DeviconValue = 'css3-original-wordmark';
export const DeviconHTML5WordMark: DeviconValue = 'html5-original-wordmark';
export const DeviconTypeScriptOriginal: DeviconValue = 'typescript-original';
export const DeviconDeviconOriginalWordmark: DeviconValue = 'devicon-original-wordmark';
export const DeviconLinuxOriginal: DeviconValue = 'linux-original';
export const DeviconBootstrapPlainWordMark: DeviconValue = 'bootstrap-plain-wordmark';
export const DeviconDotNetOriginalWordmark: DeviconValue = 'dot-net-original-wordmark';
export const DeviconDotNetPlain: DeviconValue = 'dot-net-plain';
export const DeviconAngularJSPlain: DeviconValue = 'angularjs-plain';
export const DeviconReactOriginal: DeviconValue = 'react-original';
export const DeviconAndroidOriginal: DeviconValue = 'android-original';
export const DeviconYarnOriginal: DeviconValue = 'yarn-original';
export const DeviconVueJSOriginal: DeviconValue = 'vuejs-original';
export const DeviconGoogleOriginal: DeviconValue = 'google-original';

// Map with proper typing
export const map: Map<TechnologyKey, DeviconValue> = new Map([
    ['c#', DeviconCSharpOriginal],
    ['javascript', DeviconJavaScriptPlain],
    ['css', DeviconCSS3WordMark],
    ['html', DeviconHTML5WordMark],
    ['typescript', DeviconTypeScriptOriginal],
    ['aws-sdk-net', DeviconAmazonWebServicesOriginal],
    ['linux', DeviconLinuxOriginal],
    ['bootstrap', DeviconBootstrapPlainWordMark],
    ['aspnetcore', DeviconDotNetPlain],
    ['angular', DeviconAngularJSPlain],
    ['react', DeviconReactOriginal],
    ['react-stripe-elements', DeviconReactOriginal],
    ['vue', DeviconVueJSOriginal],
    ['cli', DeviconVueJSOriginal],
    ['vuetify', DeviconVueJSOriginal],
    ['yarn', DeviconYarnOriginal],
    ['grpc', DeviconGoogleOriginal],
    ['clover-android-sdk', DeviconAndroidOriginal]
]);

// Helper function to get icon by technology key (optional)
export function getDevicon(key: TechnologyKey): DeviconValue | undefined {
    return map.get(key);
}