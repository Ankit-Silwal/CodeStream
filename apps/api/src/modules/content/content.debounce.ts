const debounceMap=new Map<string,NodeJS.Timeout>()
export function debounceSave(roomId:string,callback:()=>void){
  if(debounceMap.has(roomId)){
    clearTimeout(debounceMap.get(roomId)!)
  }
  const timeout=setTimeout(()=>{
    callback();
    debounceMap.delete(roomId)
  },1500)
  debounceMap.set(roomId,timeout)
}