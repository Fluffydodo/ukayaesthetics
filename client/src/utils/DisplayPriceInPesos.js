export const DisplayPriceInPesos = (price)=>{
    return new Intl.NumberFormat('en-PH',{
        style : 'currency',
        currency : 'PHP'
    }).format(price)
}