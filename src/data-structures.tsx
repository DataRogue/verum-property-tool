import consts from "./consts.json";
import traits from "./traits.json";
import qualities from "./qualities.json";
import { AppState } from "./App";
import { Block, ConvertBlockMatrixToTileMatrix } from './edit-property';

export class DataStructures {

    static GetSubregionByName(country:CountryType, name:string):SubregionType{
        const subregions:SubregionType[] = country.regions.flatMap(x=>x.subregions);
        const subregion = subregions.find(x=>x.name === name);
        if(subregion) return subregion as SubregionType;
        throw console.error(`No subregion with name ${name} for Country ${country.name}`);
    }

    static GetCountryDataByName(name:string):CountryType{
        const country = consts.COUNTRIES.find(country=> country.name === name);
        if(country) return country as CountryType;
        throw new Error(`No country with name ${name}`);
    }

    static GetTraitsFromNames(names:string[]):Trait[]{
        return names.map(x=>traits.find(y=>y.name===x) as Trait);
    }

    static GetQualitiesFromNames(names:string[]):QualityType[]{
        return names.map(x=>qualities.find(y=>y.name===x) as QualityType);
    }

    static ResolveValueModifier(prevVal:number, modifier:ValueModifierType):number{
        switch(modifier.type){
            case "ADD":
                return prevVal+modifier.value;
            case "MULT":
                return prevVal*modifier.value;
        }
    }
}

export type QualityType = {
    name: string,
    buildCost: ValueModifierType,
    tpValue: ValueModifierType,
    faIcon: string
}

export type TileType = {
    name: string,
    trait: string
}

export type PlayerData = {
    propertyName: string,
    playerName: string,
    lastDateModified: string,
    versionCreatedWith: string,
    countryName: string,
    regionName: string,
    regionTraitsSelected: string[],
    mapMatrix: TileType[][][]
}

export class DataSerializer {
    playerData!: PlayerData;

    constructor(input?:string){
        if(input) this.UpdateData(input);
    }

    SerializeData(){
        return JSON.stringify(this.playerData);
    }

    UpdateData(input:string){
        this.playerData = JSON.parse(input);
    }

    getAppStateFromPlayerData():AppState{
        return {
            stage: "edit",
            selectedCountry: this.playerData.countryName,
            selectedRegion: this.playerData.regionName,
            selectedTraits: this.playerData.regionTraitsSelected,
            selectedGridSize: {x:this.playerData.mapMatrix.length, y:this.playerData.mapMatrix[0].length},
            tileMatrix: this.playerData.mapMatrix
        }
    }

    ConstructData(appState:AppState){
        let data:PlayerData = {
          propertyName: "Test Property",
          playerName: "Test Player",
          lastDateModified: "Ignored",
          versionCreatedWith: "Ignored",
          countryName: appState.selectedCountry || "",
          regionName: appState.selectedRegion || "",
          regionTraitsSelected: appState.selectedTraits,
          mapMatrix: []
        };
        if(appState.tileMatrix.length > 0){
            data.mapMatrix = appState.tileMatrix;
        }
        else {
            data.mapMatrix = this.CreateEmptyTileMatrix(appState.selectedGridSize.x, appState.selectedGridSize.y);
        }
        this.playerData = data;
        return data;
    }

    SerializeToJSONAnDownload = async () =>{ 
        
        const json = JSON.stringify(this.playerData);
        const blob = new Blob([json],{type:'application/json'});
        const href = await URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = href;
        link.download = "muh_propery.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    }

    CreateEmptyTileMatrix(y:number, x:number){
        let floor:TileType[][][] = [];
        for(let i=0; i < x; i++){
            floor[i]=[];
            for(let j=0; j < y; j++){
                floor[i][j]=[];
                floor[i][j][0] = {
                name: "Empty",
                trait: ""
                }
            }
        }
        return floor;
      }
}

export type ValueModifierType = {
    type: ("ADD" | "MULT"),
    value: number
}

export type RegionType = {
    name:string,
    subregions: SubregionType[]
}

export type SubregionType = {
    name:string,
    dangerLevel:number,
    landCost:number,
    buildCost:number,
    tpValue:number,
    traits:string[];
}

export type Trait = {
    name:string,
    description:string,
    dangerLevel: ValueModifierType,
    landCost: ValueModifierType,
    buildCost: ValueModifierType,
    tpValue: ValueModifierType,
    exclusiveWith: string[]
}

export type CountryType = {
    name:string;
    imageName: string;
    regions:RegionType[];
}

export const COUNTRY_DEFAULT:CountryType = {
    name:"",
    imageName:"",
    regions:[]
};

function is<T>(o: any, sample:T, strict = true, recursive = true) : o is T {
    if( o == null) return false;
    let s = sample as any;
    // If we have primitives we check that they are of the same type and that type is not object 
    if(typeof s === typeof o && typeof o != "object") return true;

    //If we have an array, then each of the items in the o array must be of the same type as the item in the sample array
    if(o instanceof Array){
        // If the sample was not an arry then we return false;
        if(!(s instanceof Array)) return false;
        let oneSample = s[0];
        let e: any;
        for(e of o) {
            if(!is(e, oneSample, strict, recursive)) return false;
        }
    } else {
        // We check if all the properties of sample are present on o
        for(let key of Object.getOwnPropertyNames(sample)) {
            if(typeof o[key] !== typeof s[key]) return false;
            if(recursive && typeof s[key] == "object" && !is(o[key], s[key], strict, recursive)) return false;
        }
        // We check that o does not have any extra prperties to sample
        if(strict)  {
            for(let key of Object.getOwnPropertyNames(o)) {
                if(s[key] == null) return false;
            }
        }
    }

    return true;
}