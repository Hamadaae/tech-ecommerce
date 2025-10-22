export interface Review {
    rating : number,
    comment? : string,
    date? : string,
    reviewerName? : string,
    reviewerEmail? : string,
}

export interface Dimensions {
    width? : number,
    height? : number,
    depth? : number
}

export interface Meta {
    createdAt? : string,
    updatedAt? : string,
    barcode? : string,
    qrCode? : string
}

export interface Product {
    _id? : string,
    externalId? : number,
    title? : string,
    description? : string,
    category? : string,
    price? : number,
    discountPercentage? : number,
    rating? : number,
    image? : string,
    stock? : number,
    tags? : string[],
    brand? : string,
    sku? : string,
    weight? : number,
    dimensions? : Dimensions,
    warrentyInformation? : string,
    shippingInformation? : string,
    availabilityStatus? : string,
    reviews? : Review[],
    meta? : Meta,
    images? : string[],
    thumbnail? : string,
    createdAt? : string,
    updatedAt? : string

    averageRating? : number
}