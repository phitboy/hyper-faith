import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  useHLNameResolution, 
  useHLReverseResolution, 
  useHLNamesAPITest,
  useDebouncedAddressResolution,
  testHLNamesAPI 
} from '@/lib/hyperliquid-names'

/**
 * Test component for Hyperliquid Names API integration
 * This component helps verify that the API integration is working correctly
 */
export function HLNamesTest() {
  const [testInput, setTestInput] = useState('testooor.hl')
  const [manualTestResult, setManualTestResult] = useState<string>('')
  
  // Test API connectivity
  const apiTest = useHLNamesAPITest()
  
  // Test resolution with current input
  const resolution = useDebouncedAddressResolution(testInput)
  
  // Test with known example
  const knownTest = useHLNameResolution('testooor.hl')
  
  // Test reverse resolution with known address
  const reverseTest = useHLReverseResolution('0xF26F5551E96aE5162509B25925fFfa7F07B2D652')
  
  const handleManualTest = async () => {
    try {
      setManualTestResult('Testing...')
      const result = await testHLNamesAPI()
      setManualTestResult(result ? 'API Test Passed!' : 'API Test Failed')
    } catch (error) {
      setManualTestResult(`API Test Error: ${error}`)
    }
  }
  
  return (
    <div className="space-y-4 p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Hyperliquid Names API Test</CardTitle>
          <CardDescription>
            Testing the API integration with real Hyperliquid Names service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* API Connectivity Test */}
          <div>
            <h3 className="font-medium mb-2">API Connectivity</h3>
            <div className="flex items-center gap-2">
              <Badge variant={apiTest.data ? 'default' : apiTest.isLoading ? 'secondary' : 'destructive'}>
                {apiTest.isLoading ? 'Testing...' : apiTest.data ? 'Connected' : 'Failed'}
              </Badge>
              <Button onClick={handleManualTest} size="sm" variant="outline">
                Manual Test
              </Button>
              {manualTestResult && (
                <span className="text-sm text-muted-foreground">{manualTestResult}</span>
              )}
            </div>
          </div>
          
          {/* Known Example Test */}
          <div>
            <h3 className="font-medium mb-2">Known Example: testooor.hl</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Expected:</strong> 0xF26F5551E96aE5162509B25925fFfa7F07B2D652
              </div>
              <div className="text-sm">
                <strong>Actual:</strong> {knownTest.isLoading ? 'Loading...' : knownTest.data?.address || 'Not resolved'}
              </div>
              <Badge variant={
                knownTest.data?.isValid && 
                knownTest.data.address.toLowerCase() === '0xF26F5551E96aE5162509B25925fFfa7F07B2D652'.toLowerCase()
                  ? 'default' : 'destructive'
              }>
                {knownTest.isLoading ? 'Testing...' : 
                 knownTest.data?.isValid && 
                 knownTest.data.address.toLowerCase() === '0xF26F5551E96aE5162509B25925fFfa7F07B2D652'.toLowerCase()
                   ? 'Passed' : 'Failed'}
              </Badge>
            </div>
          </div>
          
          {/* Reverse Resolution Test */}
          <div>
            <h3 className="font-medium mb-2">Reverse Resolution Test</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Address:</strong> 0xF26F5551E96aE5162509B25925fFfa7F07B2D652
              </div>
              <div className="text-sm">
                <strong>Resolved Name:</strong> {reverseTest.isLoading ? 'Loading...' : reverseTest.data?.name || 'No name found'}
              </div>
              <Badge variant={reverseTest.data?.name ? 'default' : 'secondary'}>
                {reverseTest.isLoading ? 'Testing...' : reverseTest.data?.name ? 'Found' : 'No Name'}
              </Badge>
            </div>
          </div>
          
          {/* Interactive Test */}
          <div>
            <h3 className="font-medium mb-2">Interactive Test</h3>
            <div className="space-y-2">
              <Input
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter .hl name or address"
              />
              <div className="space-y-1 text-sm">
                <div><strong>Input Type:</strong> {resolution.inputType}</div>
                <div><strong>Is Valid:</strong> {resolution.isValid ? 'Yes' : 'No'}</div>
                <div><strong>Resolved Address:</strong> {resolution.resolvedAddress || 'None'}</div>
                <div><strong>Display Name:</strong> {resolution.displayName || 'None'}</div>
                <div><strong>Loading:</strong> {resolution.isLoading ? 'Yes' : 'No'}</div>
                {resolution.error && (
                  <div className="text-destructive"><strong>Error:</strong> {resolution.error.message}</div>
                )}
              </div>
            </div>
          </div>
          
        </CardContent>
      </Card>
    </div>
  )
}
