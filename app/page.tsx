'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, MessageCircle, BookOpen, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">MindSpace</h1>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button>Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Personal Space for 
            <span className="text-indigo-600"> Mental Wellness</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Track your mood, journal your thoughts, and get AI-powered support for your mental health journey. 
            Join thousands who've improved their wellbeing with MindSpace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="px-8 py-3 text-lg">
                Start Your Journey
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need for mental wellness
          </h3>
          <p className="text-lg text-gray-600">
            Comprehensive tools designed to support your mental health journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">Daily Journaling</CardTitle>
              <CardDescription>
                Express your thoughts and feelings with guided prompts and free writing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Mood Tracking</CardTitle>
              <CardDescription>
                Monitor your emotional patterns with visual charts and insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">AI Support</CardTitle>
              <CardDescription>
                Get personalized responses and coping strategies from our AI assistant
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Progress Analytics</CardTitle>
              <CardDescription>
                Visualize your mental health journey with detailed analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Secure & Private</CardTitle>
              <CardDescription>
                Your data is encrypted and protected with enterprise-grade security
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-teal-600" />
              </div>
              <CardTitle className="text-xl">Personalized Experience</CardTitle>
              <CardDescription>
                Tailored recommendations based on your unique mental health patterns
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to start your wellness journey?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of users who have improved their mental health with MindSpace. 
            Start tracking your mood, journaling your thoughts, and getting personalized support today.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="px-8 py-3 text-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-semibold text-gray-900">MindSpace</span>
          </div>
          <p className="text-gray-600">
            Your personal space for mental wellness and growth
          </p>
        </div>
      </footer>
    </div>
  );
}