import {
  Tabs as BaseTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Props {
  addLinux?: boolean;
}

export default function Tabs({ addLinux = false }: Props) {
  return (
    <BaseTabs defaultValue="mac/linux">
      <TabsList>
        <TabsTrigger value="mac/linux">
          {addLinux ? "Mac" : "Mac/Linux"}
        </TabsTrigger>
        <TabsTrigger value="windows">Windows</TabsTrigger>
        {addLinux && <TabsTrigger value="linux">Linux</TabsTrigger>}
      </TabsList>
      <TabsContent value="mac/linux">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="windows">Change your password here.</TabsContent>
      {addLinux && <TabsContent value="Linux">Linux</TabsContent>}
    </BaseTabs>
  );
}
