declare module 'vast-client' {
  export class VASTClient {
    get(url: string): Promise<VASTResponse>
  }
  export interface VASTResponse {
    ads?: VASTAd[]
  }
  export interface VASTAd {
    creatives?: VASTCreative[]
  }
  export interface VASTCreative {
    mediaFiles?: VASTMediaFile[]
    trackingEvents?: Record<string, string[]>
  }
  export interface VASTMediaFile {
    fileURL: string
    mimeType: string
  }
}
