import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingChatBubbles } from "@/components/floating-chat-bubbles";
import {
  VoiceIcon,
  AiBrain04Icon,
  ComputerIcon,
  CarIcon,
  LayoutIcon,
  CodeIcon,
  MenuRestaurantIcon,
  Invoice02Icon,
  Rocket,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  SparklesIcon,
  Microphone,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export default function LandingPage() {
  const features = [
    {
      icon: Microphone,
      title: "Voice-Powered Ordering",
      description: "Customers place orders naturally through conversation. No menus to navigate, just speak.",
    },
    {
      icon: AiBrain04Icon,
      title: "AI-Powered Intelligence",
      description: "Advanced AI understands context, preferences, and handles complex orders with ease.",
    },
    {
      icon: MenuRestaurantIcon,
      title: "Smart Menu Management",
      description: "Easily manage your menu, categories, and availability. Update prices and items instantly.",
    },
    {
      icon: Invoice02Icon,
      title: "Real-Time Order Tracking",
      description: "Track orders from placement to completion. Get notified when orders are ready.",
    },
    {
      icon: SparklesIcon,
      title: "Knowledge Base",
      description: "Train your AI with restaurant-specific information, specials, and customer preferences.",
    },
    {
      icon: Settings01Icon,
      title: "Easy Setup",
      description: "Get started in minutes. No coding required. Configure your voice agent and deploy.",
    },
  ];

  const useCases = [
    {
      icon: ComputerIcon,
      title: "Kiosk",
      description: "In-store self-service ordering kiosk",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: CarIcon,
      title: "Drive-Thru",
      description: "Voice ordering at drive-thru windows",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      icon: LayoutIcon,
      title: "Tablet",
      description: "Table-side ordering for dine-in customers",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: CodeIcon,
      title: "QR Code",
      description: "Place QR codes on tables for customer self-service",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  const benefits = [
    "Reduce wait times and improve customer satisfaction",
    "Handle multiple orders simultaneously",
    "24/7 availability without additional staff",
    "Lower operational costs",
    "Increase order accuracy",
    "Scale effortlessly during peak hours",
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="text-primary flex items-center justify-center rounded-md">
              <HugeiconsIcon icon={VoiceIcon} className="size-6" />
            </div>
            <span className="text-xl">Chattable</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-linear-to-b from-background to-muted/20 py-20 md:py-32 lg:py-36 xl:py-44">
        <BackgroundRippleEffect />

        {/* Floating Chat Bubbles */}
        <FloatingChatBubbles />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
              <HugeiconsIcon icon={SparklesIcon} className="size-4 text-primary" />
              <span className="text-muted-foreground">Powered by Gemini & ElevenLabs</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Turn Ordering Into a
              <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}
                Natural Conversation
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl">
              Chattable turns voice into an AI employee that takes orders, answers menu questions, and sends them
              straight to the kitchen
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Get Started Free
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Transform Your Restaurant
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to streamline ordering and enhance customer experience
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 w-fit">
                    <HugeiconsIcon icon={feature.icon} className="size-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="mt-2">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Deploy Anywhere, Anytime</h2>
            <p className="text-lg text-muted-foreground">
              Your voice agent works across multiple platforms and use cases
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((useCase) => (
              <Card key={useCase.title} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div
                    className={`mb-4 inline-flex items-center justify-center rounded-lg p-3 w-fit ${useCase.bgColor}`}
                  >
                    <HugeiconsIcon icon={useCase.icon} className={`size-6 ${useCase.color}`} />
                  </div>
                  <CardTitle>{useCase.title}</CardTitle>
                  <CardDescription className="mt-2">{useCase.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
              <p className="text-lg text-muted-foreground">Get started in minutes. No technical knowledge required.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 size-12 text-2xl font-bold text-primary">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold">Set Up Your Restaurant</h3>
                <p className="text-muted-foreground">
                  Create your account, add your restaurant details, and upload your menu.
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 size-12 text-2xl font-bold text-primary">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold">Train Your AI</h3>
                <p className="text-muted-foreground">
                  Add your knowledge base with restaurant-specific information, specials, and preferences.
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 size-12 text-2xl font-bold text-primary">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold">Deploy & Go Live</h3>
                <p className="text-muted-foreground">
                  Publish your voice agent to kiosks, tablets, or QR codes. Start accepting orders immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Why Restaurants Love Chattable</h2>
              <p className="text-lg text-muted-foreground">Join restaurants transforming their ordering experience</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mt-0.5 size-5 shrink-0 text-primary" />
                  <p className="text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
              <HugeiconsIcon icon={Rocket} className="size-4 text-primary" />
              <span className="text-muted-foreground">Ready to get started?</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Transform Your Restaurant Today</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join the future of restaurant ordering. Set up your voice agent in minutes.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Get Started Free
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={VoiceIcon} className="size-5 text-primary" />
                <span className="font-semibold">Chattable</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Chattable. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
