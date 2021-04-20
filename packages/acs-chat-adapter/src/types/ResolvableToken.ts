type ResolvableToken = string | Promise<string> | (() => string) | (() => Promise<string>);

export default ResolvableToken;
