import React from 'react';

const Features = () => {
  const features = [
    { title: 'Easy to Use', description: 'Simple interface to quickly generate your README' },
    { title: 'Customizable', description: 'Tailor your README to your personal style' },
    { title: 'Fun and Creative', description: 'Stand out with a unique and engaging profile' },
  ];

  return (
    <div className="py-20 bg-bg-secondary dark:bg-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-dark-1 dark:text-dark-1 text-center mb-12">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-bg dark:bg-zinc-900 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-accent mb-2">{feature.title}</h3>
              <p className="text-text-secondary dark:text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;