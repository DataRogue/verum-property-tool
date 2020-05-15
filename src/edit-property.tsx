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

export class Block {
    tile:TileConstType;
    trait?:QualityType;
    constructor(data:{tile?:TileType, const?:TileConstType, trait?:string}){
        if(data.tile){
            let t = data.tile;
            this.tile = consts.TILES.INDOOR.find(x=>x.tileDisplayName === t.name) as TileConstType;
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
            <div className="row">
                <div className="col-2">
                    <h2>Blocks:</h2>
                    <h3>Indoor:</h3>
                        <ul>
                        {
                            consts.TILES.INDOOR.map((tile, i) => this.createTileTypeLegendsView(tile, i))
                        }
                        </ul>
                    <br/>

                    <h3>Outdoor:</h3>
                    <div>Field <span className="tile tile-field"></span></div>
                    <div>Decorated <span className="tile tile-decorated"></span></div>
                    <div>Well Decorated <span className="tile tile-well-decorated"></span></div>
                    <div>Very Decorated <span className="tile tile-very-decorated"></span></div>

                    <h3>Special:</h3>
                    <div>Reinforced Wooden Wall <span className="tile tile-wooden-wall"></span></div>
                    <div>Reinforced Stone Wall <span className="tile tile-stone-wall"></span></div>
                    <div>Escape Tunnel <span className="tile tile-escape-tunnel"></span></div>
                </div>
                <div className="col-7">
                    <table ref={this.table} className="block-matrix-table">
                        <tbody>
                        {
                            this.state.blockMatrix.map((yRow, i) =>(
                                <tr key={i}>
                                {
                                    yRow.map((block, j) => (
                                        <BlockView key={j} blockData={block[this.state.currentLevel]} coords={{x:i,y:j}}
                                         clickCallback={this.updateTileAtCoords.bind(this)}
                                         height={(this.table.current?.clientWidth || 0)/this.state.blockMatrix.length}
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
                    <h4>Tile Qualities</h4>
                     <ul>
                         {
                             DataStructures.GetQualitiesFromNames(this.state.selectedTileType.possibleQualities).map((quality, i)=>(
                                <li onClick={()=>this.QualitySelected(quality.name)} key={i} className={quality.name === this.state.selectedQuality ? 'active' : ''} >
                                    {quality.name}
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