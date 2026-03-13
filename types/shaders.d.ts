// Ambient module declarations for GLSL shader file imports.
// Allows TypeScript to resolve *.glsl, *.vert, and *.frag imports without TS2307 errors.
declare module '*.glsl' {
  const value: string
  export default value
}

declare module '*.vert' {
  const value: string
  export default value
}

declare module '*.frag' {
  const value: string
  export default value
}
