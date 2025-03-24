import { BookOpen, Upload, Shield, Lock, Globe } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Upload className="w-12 h-12 text-blue-600" />,
      title: "Secure Document Upload",
      description: "Easily upload and store your documents with end-to-end encryption and secure storage on IPFS."
    },
    {
      icon: <Shield className="w-12 h-12 text-blue-600" />,
      title: "Military-Grade Encryption",
      description: "Your documents are protected with advanced encryption, ensuring maximum privacy and security."
    },
    {
      icon: <Lock className="w-12 h-12 text-blue-600" />,
      title: "Access Control",
      description: "Manage who can view and access your documents with granular permission settings."
    },
    {
      icon: <Globe className="w-12 h-12 text-blue-600" />,
      title: "Decentralized Storage",
      description: "Leverage the power of IPFS for distributed, resilient document storage across a global network."
    },
    {
      icon: <BookOpen className="w-12 h-12 text-blue-600" />,
      title: "Document Management",
      description: "Organize, search, and manage your documents with an intuitive and powerful interface."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Secure Document Management Platform
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Protect, Store, and Manage Your Documents with Cutting-Edge Technology
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
              Get Started
            </button>
            <button className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-blue-800 max-w-2xl mx-auto">
            A comprehensive solution for secure, decentralized document management
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex items-center mb-4">
                {feature.icon}
                <h3 className="ml-4 text-xl font-semibold text-blue-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-blue-800">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-100 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Ready to Secure Your Documents?
          </h2>
          <p className="text-xl text-blue-800 mb-8">
            Join thousands of users protecting their most important files
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Create Account
            </button>
            
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2024 Secure Document Management Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}