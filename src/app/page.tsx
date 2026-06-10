import { ProductDemo } from "@/components/product-demo";
import { PRODUCT } from "@/components/product-demo/config";
import { FernLogo } from "@/components/fern-logo";

export default function Home() {
  return (
    <main className="demo-page">
      <div className="demo-page-heading">
        <FernLogo height={40} width={40} style={{ display: "block", margin: "0 auto 16px" }} />
        <h1>Product Demo Template by {PRODUCT.name}</h1>
        <p>{PRODUCT.tagline}</p>
      </div>
      <ProductDemo />
    </main>
  );
}
