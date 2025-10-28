import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { settingsAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { CogIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [aiSettings, setAiSettings] = useState({
    openRouterApiKey: '',
    modelName: 'openai/gpt-4o',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      if (response.success && response.data) {
        setAiSettings({
          openRouterApiKey: '', // Don't show the actual key for security
          modelName: response.data.settings.modelName || 'openai/gpt-4o',
        });
      }
    } catch (error: any) {
      showError('Error', 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAiSettings = async () => {
    if (!aiSettings.openRouterApiKey.trim()) {
      showError('Validation Error', 'OpenRouter API key is required');
      return;
    }

    try {
      setSaving(true);
      const response = await settingsAPI.updateAISettings(aiSettings);
      if (response.success) {
        showSuccess('Settings Saved', 'AI settings have been updated successfully');
      }
    } catch (error: any) {
      showError('Save Failed', error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const response = await settingsAPI.testAIConnection();
      if (response.success) {
        showSuccess('Connection Test', 'AI connection test successful!');
      } else {
        showError('Connection Test', 'AI connection test failed');
      }
    } catch (error: any) {
      showError('Connection Test', 'AI connection test failed');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <CogIcon className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Configure your AI hiring platform</p>
          </div>
        </div>
      </div>

      {/* AI Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">AI Configuration</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenRouter API Key *
            </label>
            <input
              type="password"
              className="input"
              placeholder="Enter your OpenRouter API key"
              value={aiSettings.openRouterApiKey}
              onChange={(e) => setAiSettings(prev => ({ ...prev, openRouterApiKey: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500">OpenRouter Keys Dashboard</a>. 
              Format: sk-or-v1-xxxxx...
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Model *
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g., openai/gpt-4o"
              value={aiSettings.modelName}
              onChange={(e) => setAiSettings(prev => ({ ...prev, modelName: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the model name from OpenRouter (e.g., openai/gpt-4o, anthropic/claude-3-sonnet)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveAiSettings}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save AI Settings'
              )}
            </button>

            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="btn-outline"
            >
              {testing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Popular Models */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular AI Models</h2>
        <p className="text-sm text-gray-600 mb-4">
          Click on any model below to use it, or enter a custom model name in the field above.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OpenAI Models */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">OpenAI Models</h4>
            <div className="space-y-2">
              {[
                { name: 'openai/gpt-4o', desc: 'Latest GPT-4 Omni (Recommended)', price: '$$' },
                { name: 'openai/gpt-4-turbo', desc: 'GPT-4 Turbo (Fast & Capable)', price: '$$' },
                { name: 'openai/gpt-4', desc: 'GPT-4 (High Quality)', price: '$$$' },
                { name: 'openai/gpt-3.5-turbo', desc: 'GPT-3.5 Turbo (Budget Friendly)', price: '$' },
              ].map((model) => (
                <button
                  key={model.name}
                  onClick={() => setAiSettings(prev => ({ ...prev, modelName: model.name }))}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.desc}</div>
                    </div>
                    <span className="text-xs text-gray-400">{model.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Anthropic Models */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Anthropic Models</h4>
            <div className="space-y-2">
              {[
                { name: 'anthropic/claude-3-5-sonnet', desc: 'Claude 3.5 Sonnet (Latest)', price: '$$' },
                { name: 'anthropic/claude-3-sonnet', desc: 'Claude 3 Sonnet (Balanced)', price: '$$' },
                { name: 'anthropic/claude-3-haiku', desc: 'Claude 3 Haiku (Fast)', price: '$' },
                { name: 'anthropic/claude-2', desc: 'Claude 2 (Legacy)', price: '$' },
              ].map((model) => (
                <button
                  key={model.name}
                  onClick={() => setAiSettings(prev => ({ ...prev, modelName: model.name }))}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.desc}</div>
                    </div>
                    <span className="text-xs text-gray-400">{model.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">
            <strong>Price Guide:</strong> $ = Budget-friendly (~$0.50-2/1M tokens), $$ = Moderate cost (~$3-15/1M tokens), $$$ = Premium pricing (~$30+/1M tokens)
          </p>
          <p className="text-xs text-gray-600">
            <strong>Recommendation:</strong> Start with <code className="bg-white px-1 rounded">openai/gpt-4o</code> for best balance of quality and cost.
            For high volume, consider <code className="bg-white px-1 rounded">openai/gpt-3.5-turbo</code>.
          </p>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Setup Instructions</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Step 1:</strong> Sign up for an account at <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="underline">OpenRouter.ai</a>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Step 2:</strong> Add credits to your OpenRouter account (minimum $5 recommended)
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Step 3:</strong> Generate an API key from your OpenRouter dashboard → Keys
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Step 4:</strong> Enter your API key above and choose a model (openai/gpt-4o recommended)
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Step 5:</strong> Test the connection to ensure everything is working
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Step 6:</strong> Start creating jobs with AI-powered interviews!
            </div>
          </div>
        </div>
      </div>

      {/* AI Interview Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">AI Interview Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Questions
            </label>
            <input
              type="number"
              min="1"
              max="20"
              className="input"
              defaultValue="5"
              placeholder="5"
            />
            <p className="text-xs text-gray-500 mt-1">
              How many questions to ask per interview (1-20)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Timeout (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              className="input"
              defaultValue="10"
              placeholder="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              Time limit per question (1-60 minutes)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passing Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="input"
              defaultValue="70"
              placeholder="70"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum score to pass the interview
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Temperature
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              className="input"
              defaultValue="0.7"
              placeholder="0.7"
            />
            <p className="text-xs text-gray-500 mt-1">
              AI creativity level (0.0 = focused, 2.0 = creative)
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Question Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-700">Technical Questions</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-700">Behavioral Questions</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-700">Situational Questions</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-700">General Questions</span>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">Advanced Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-700">Auto-generate questions based on job description</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-700">Provide real-time feedback to candidates</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Allow candidates to retake interviews</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-700">Generate detailed evaluation reports</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn-primary">
            Save Interview Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;