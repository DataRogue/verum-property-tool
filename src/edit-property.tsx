import React, { Component, createRef } from 'react'; // let's also import Component
import './edit-property.scss';
import consts from "./consts.json";
import qualities from "./qualities.json";
import { PlayerData, TileType, DataStructures, QualityType } from './data-structures';

export type TileConstType = {
    tileDisplayName: string;
    color: string;
    baseTpCost: number;
    baseGpCost: number;
    possibleQualities: string[];
}

const allTiles = consts.TILES.INDOOR.concat(consts.TILES.OUTDOOR, consts.TILES.SPECIAL);

export class Block {
    tile:TileConstType;
    trait?:QualityType;
    constructor(data:{tile?:TileType, const?:TileConstType, trait?:string}){
        if(data.tile){
            let t = data.tile;
            this.tile = allTiles.find(x=>x.tileDisplayName === t.name) as TileConstType;
            this.trait = this.GetQualityByName(t.trait);
        } else if(data.const) {
            this.tile = data.const;
            if(data.trait && data.trait!==""){
                this.trait = this.GetQualityByName(data.trait);
            }
        }
        else {
            throw console.error("Need either 'tile' or 'const' defined");
        }
    }
    
    GetQualityByName(name:string):QualityType{
        return qualities.find(x=>x.name===name) as QualityType;
    }

    ConvertToTileType():TileType{
        return {
            name: this.tile.tileDisplayName,
            trait: this.trait?.name || ""
        }
    }
}

type PropertyState = {
    blockMatrix:Block[][][],
    selectedTileType:TileConstType,
    currentLevel: number,
    currentlySelectedTraits: string[],
    selectedQuality:string
}

export function ConvertTileMatrixToBlockMatrix(mapMatrix:TileType[][][]):Block[][][]{
    return mapMatrix.map(x=>x.map(y=>y.map(z=>new Block({tile:z}))));
}

export function ConvertBlockMatrixToTileMatrix(mapMatrix:Block[][][]):TileType[][][]{
    return mapMatrix.map(x=>x.map(y=>y.map(z=>z.ConvertToTileType())));
}

export class EditProperty extends Component<{data:PlayerData, blockUpdatedCallback:Function}, PropertyState> {
    constructor(props: any) {
      super(props)
      this.state = {
          blockMatrix : ConvertTileMatrixToBlockMatrix(props.data.mapMatrix),
          selectedTileType: consts.TILES.INDOOR[0],
          currentLevel: 0,
          currentlySelectedTraits: [],
          selectedQuality: ""
      }
    }

    private table = createRef<HTMLTableElement>();

    componentDidMount(){
        this.forceUpdate();
    }

    TileSelected(tile:TileConstType){
        this.setState({
            selectedTileType:tile
        })
    }

    QualitySelected(quality:string){
        this.setState({
            selectedQuality: this.state.selectedQuality === quality ? "" : quality
        })
    }


    createTileTypeLegendsView(tile:TileConstType, i:number) {
        return(
            <li onClick={()=>this.TileSelected(tile)} key={i} className={`tile-${tile.tileDisplayName} ${(tile.tileDisplayName === this.state.selectedTileType.tileDisplayName ? 'active' : '')}`}>
                {tile.tileDisplayName} <span className="color-block" style={{backgroundColor:tile.color}}></span>
            </li>
        )
    }

    updateTileAtCoords(coords:{x:number, y:number}){
        const block:Block = new Block({const:this.state.selectedTileType, trait:this.state.selectedQuality});
        this.state.blockMatrix[coords.x][coords.y][this.state.currentLevel] = block;
        this.props.blockUpdatedCallback(this.state.blockMatrix);
        this.forceUpdate();
    }

    render(){
        let flattenedBlocks: Block[] = this.state.blockMatrix.flat().flat();
        //let calculatedTpCost: number = flattenedBlocks.map(block=>block.tile.baseTpCost).reduce((accumulator, currentValue) => accumulator + currentValue);
        //let calculatedGoldCost: number = flattenedBlocks.map(block=>block.tile.baseGpCost).reduce((accumulator, currentValue) => accumulator + currentValue);

        return (
            <div className="row edit-view">
                <div className="col-3">
                    <h2>Blocks</h2>
                    <hr/>
                    <h3>Indoor</h3>
                        <ul>
                        {
                            consts.TILES.INDOOR.map((tile, i) => this.createTileTypeLegendsView(tile, i))
                        }
                        </ul>
                    <br/>

                    <h3>Outdoor</h3>
                    <hr/>
                    <ul>
                        {
                            consts.TILES.OUTDOOR.map((tile, i) => this.createTileTypeLegendsView(tile, i))
                        }
                    </ul>
                    <br/>

                    <h3>Special</h3>
                    <hr/>
                    <ul>
                        {
                            consts.TILES.SPECIAL.map((tile, i) => this.createTileTypeLegendsView(tile, i))
                        }
                    </ul>
                </div>
                <div className="col">
                    <table ref={this.table} className="block-matrix-table">
                        <tbody>
                        {
                            this.state.blockMatrix.map((xRow, i) =>(
                                <tr key={i}>
                                {
                                    xRow.map((block, j) => (
                                        <BlockView key={j} blockData={block[this.state.currentLevel]} coords={{x:i,y:j}}
                                         clickCallback={this.updateTileAtCoords.bind(this)}
                                         height={(this.table.current?.clientWidth || 0)/xRow.length}
                                         />
                                    ))
                                }
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
                <div className="col-3">
                    <br/>
                    <h3>Tile Qualities</h3>
                     <ul>
                         {
                             DataStructures.GetQualitiesFromNames(this.state.selectedTileType.possibleQualities).map((quality, i)=>(
                                <li onClick={()=>this.QualitySelected(quality.name)} key={i} className={quality.name === this.state.selectedQuality ? 'active' : ''} >
                                    {quality.name} <i className={`fas fa-${quality.faIcon || ""}`}></i>
                                </li>  
                             ))
                         }
                     </ul>
                </div>
            </div>
        );
    }
  }

  class BlockView extends Component<{blockData:Block, clickCallback:Function, coords:{x:number, y:number}, height:number}> {
    constructor(props: any) {
      super(props)
    }

    render(){
        return (
            <td onClick={()=>this.props.clickCallback(this.props.coords)}
                style={{backgroundColor:this.props.blockData.tile.color, height:this.props.height}}
            >
                <i className={`fas fa-${this.props.blockData.trait?.faIcon || ""}`}></i>
                </td>
        )
    }

}