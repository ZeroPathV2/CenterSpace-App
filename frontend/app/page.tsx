// "use state"
import Header from "./components/header/Header";
import SocialLayout from "./components/socialLayout/SocialLayout";

// "use client"
export default function Home() {
  return (
    <div>
      <Header />
      <SocialLayout />
    </div>
  );
}
