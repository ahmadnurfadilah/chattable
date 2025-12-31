import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UseCaseCard } from "@/components/publish/use-case-card";
import { UrlDisplay } from "@/components/publish/url-display";
import { ComputerIcon, CarIcon, LayoutIcon, CodeIcon } from "@hugeicons/core-free-icons";

export default async function PublishPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const organizationId = session.session?.activeOrganizationId;

  if (!organizationId) {
    return (
      <div className="p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Publish</h1>
            <p className="text-sm text-muted-foreground">Publish your voice agent to your store</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No active restaurant found. Please select a restaurant first.</p>
        </div>
      </div>
    );
  }

  // Get base URL from environment or construct from headers
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
  const orderUrl = `${baseUrl}/order/${organizationId}`;

  const useCases = [
    {
      title: "Kiosk",
      description: "In-store self-service ordering kiosk",
      icon: ComputerIcon,
      instructions: [
        "Open the agent URL on a kiosk device or tablet",
        "Place the device in a visible location for customers",
        "Customers can interact with the voice agent to place orders",
        "Ensure the device has microphone access enabled",
      ],
    },
    {
      title: "Drive-thru",
      description: "Voice ordering at drive-thru windows",
      icon: CarIcon,
      instructions: [
        "Set up a device with microphone near the drive-thru window",
        "Open the agent URL on the device",
        "Customers speak their orders naturally to the agent",
        "The agent processes orders and confirms details",
      ],
    },
    {
      title: "Tablet",
      description: "Table-side ordering for dine-in customers",
      icon: LayoutIcon,
      instructions: [
        "Place tablets on restaurant tables with the agent URL open",
        "Customers can interact with the voice agent at their table",
        "No need to wait for staff - customers order directly",
        "Orders are sent automatically to the kitchen",
      ],
    },
    {
      title: "QR Code",
      description: "Place QR codes on tables for customer self-service",
      icon: CodeIcon,
      instructions: [
        "Download the QR code from the URL display above",
        "Print and place QR codes on each restaurant table",
        "Customers scan the QR code with their mobile devices",
        "They can place orders using voice commands directly",
      ],
    },
  ];

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publish</h1>
          <p className="text-sm text-muted-foreground">Publish your voice agent to your store</p>
        </div>
      </div>

      <UrlDisplay url={orderUrl} />

      <div>
        <h2 className="text-lg font-semibold mb-4">How to Use</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useCases.map((useCase) => (
            <UseCaseCard
              key={useCase.title}
              title={useCase.title}
              description={useCase.description}
              icon={useCase.icon}
              instructions={useCase.instructions}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
