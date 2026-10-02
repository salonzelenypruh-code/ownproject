import { Gallery } from "@/components/Gallery";
import { getPhotos } from "@/lib/data";

export const metadata = {
  title: "Galerie salonu",
  description: "Fotografie salonu Kosmetika a masáže na Zeleném pruhu v Praze 4 – ošetřovna, masážní místnost a čekárna.",
};

export default async function Galerie() {
  const photos = await getPhotos("galerie");
  return (
    <>
      <div className="page-head wrap">
        <span className="eyebrow">Nahlédněte do salonu</span>
        <h1>Galerie</h1>
      </div>
      <div className="wrap page-body">
        <Gallery photos={photos} placeholders={photos.length < 4 ? 4 - photos.length : 0} />
      </div>
    </>
  );
}
