import { IconSymbol } from "@/components/ui/IconSymbol";
import Entypo from '@expo/vector-icons/Entypo';

export const icon = {
    index: (props: any) => (
      <IconSymbol name='house.fill' color={'black'} size={24} {...props}/>
    ),
    explore: (props: any) => (
      <IconSymbol name='chevron.left.forwardslash.chevron.right' color={'black'} size={24} {...props}/>
    ), 
    camera: (props: any) => (
      <IconSymbol name='camera.fill'  color={'black'} size={24} {...props}/>
    )
    ,
    statistics: (props: any) => (
      <IconSymbol name='table' color={'black'} size={24} {...props}/>
    )
  }