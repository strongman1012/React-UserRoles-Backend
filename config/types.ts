// Define the Team interface
export interface Team {
    id: number;
    name: string;
    description?: string;
    business_unit_id?: number | null;
    is_default: boolean;
    business_name?: string;
    ids?: number[];
    removeIds?: number[];
    role_id?: number;
}

// Define the Business unit interface
export interface BusinessUnit {
    id: number;
    name: string;
    parent_id?: number | null;
    admin_id?: number | null;
    website?: string;
    mainPhone?: string;
    otherPhone?: string;
    fax?: string;
    email?: string;
    street1?: string;
    street2?: string;
    street3?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    region?: string;
    parent_name?: string;
    admin_name?: string;
}

// Define the User interface
export interface UserAttributes {
    id: number;
    userName: string;
    email: string;
    password: string;
    fullName?: string;
    mobilePhone?: string;
    mainPhone?: string;
    status?: boolean;
    photo?: string;
    role_ids?: string | null | undefined;
    business_unit_id?: number | undefined;
    team_ids?: string | null;
    business_name?: string;
}

// Define the Application interface
export interface Application {
    id: number;
    name: string;
    description: string;
}

// Define the AreaList interface
export interface AreaList {
    id: number;
    role_id: number;
    area_id: number;
    data_access_id: number;
    permission: boolean;
    application_name: string;
    area_name: string;
    level?: number;
    read?: boolean;
    create?: boolean;
    update?: boolean;
    delete?: boolean;
}