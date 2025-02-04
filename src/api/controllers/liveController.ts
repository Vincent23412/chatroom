import { Request, Response, RequestHandler } from "express";

export const liveData: RequestHandler = (req: Request, res: Response) => {
    let report = `在台南舉行的中華職棒二軍交手中，統一7-ELEVEn獅二軍持續於主場迎戰近期氣勢正盛的味全龍。此役，味全龍派出先發投手林鋅杰登板，他雖然在投球過程中一度面臨獅隊打線的猛烈攻勢，仍能穩住陣腳。最終主投5.1局，被敲6支安打，送出4次三振，順利拿下勝投，帶領球隊以5：4力克統一獅，成功將戰線延長至斗六。
比賽開始，陽念祖率先敲出安打替味全開啟攻勢，林智勝也適時補上一支關鍵安打，將本場第一分收入囊中。第二局下，統一獅迅速回敬，林培緯與羅暐捷的連續二壘安打扳平比分，也讓在場觀眾為之沸騰。第四局上半，獅隊先發投手宋文華因用球數偏高退場，改由傅于剛上場中繼；然而他面對味全強打者陳思仲與全浩瑋顯得有些吃力，先被敲出深遠二壘安打，接著全浩瑋補上一發左外野全壘打，一口氣讓味全再添2分。
雖然第五局下統一迅速發動反攻，田子杰敲安上壘後，何恆佑馬上轟出兩分砲，將比數追成3：3平手。可惜第六局上，獅隊中繼投手鄭副豪控球不穩，先保送鄭鎧文上壘，再被陳思仲的二壘安打攻下1分，隨後全浩瑋四壞保送、石翔宇適時敲出深遠安打，讓味全再添1分，將比數改寫為5：3。雖然統一在六局下仍試圖反撲，羅暐捷靠游擊手失誤上壘、張皓崴敲安追回1分，但後續打線無法延續攻勢。最終，味全龍就以5：4擊敗統一獅，成功扳回一城，也讓接下來移師斗六的比賽備受期待。`; 
    res.status(200).send({report}); 
}