export type SessionType = 'dropin' | 'clinic'

export interface VolleyballApiResponse {
  records: SessionRecord[]
}

export interface SessionRecord {
  id: string
  locationId: string
  createdAt: string
  updatedAt: string
  properties: SessionProperties
  programObject: ProgramObject
  locationObject: LocationObject
  slotsFilled: number
  isWaitlist: boolean
}

export interface SessionProperties {
  session_name: string
  status?: 'active' | 'inactive'
  session_id: string
  session_information: string // HTML string
  currently_registered: number
  session_cost: number
  age: string
  session_start_date: string // YYYY-MM-DD
  session_end_date: string
  session_start_hour: string
  session_start_minute: string
  session_end_hour: string
  session_end_minute: string
  session_capacity: number
  repeating: string
  private_signup_link: string
  allow_waitlist?: 'yes' | 'no'
}

export interface LocationObject {
  record: {
    id: string
    properties: LocationProperties
  }
}

export interface LocationProperties {
  location_name: string
  address: string
  city: string
  province: string
  postal_code: string
  additional_information: string // HTML string
}

export interface ProgramObject {
  record: {
    id: string
    properties: ProgramProperties
  }
}

export interface ProgramProperties {
  program_name: string
  program_type: 'drop_in' | 'clinic' | string
  program_information: string
  start_date: string
  end_date: string
}
