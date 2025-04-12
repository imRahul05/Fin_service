import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "../hooks/use-toast";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  FiUser, FiSettings, FiLock, FiEdit, FiCamera, FiSave, 
  FiRefreshCw, FiCreditCard, FiTrello, FiTarget, FiClipboard, 
  FiMail, FiShield, FiDollarSign 
} from "react-icons/fi";

export default function Profile() {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [email] = useState(currentUser?.email || "");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [financialPreferences, setFinancialPreferences] = useState({
    riskTolerance: "moderate",
    investmentGoals: "retirement",
    savingsTarget: 1000,
  });
  
  const fileInputRef = useRef();
  const { toast } = useToast();
  const db = getFirestore();
  const storage = getStorage();
  
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const docRef = doc(db, "userPreferences", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTwoFactorEnabled(data.twoFactorEnabled || false);
          setEmailNotifications(data.emailNotifications || true);
          if (data.financialPreferences) {
            setFinancialPreferences(data.financialPreferences);
          }
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };
    
    if (currentUser) {
      fetchUserPreferences();
    }
  }, [currentUser, db]);
  
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setLoading(true);
      const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateUserProfile(displayName, downloadURL);
      setPhotoURL(downloadURL);
      
      toast({
        title: "Success!",
        description: "Profile picture updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Update profile in Firebase Authentication
      await updateUserProfile(displayName, photoURL);
      
      // Save preferences to Firestore
      await setDoc(doc(db, "userPreferences", currentUser.uid), {
        twoFactorEnabled,
        emailNotifications,
        financialPreferences,
        lastUpdated: new Date(),
      }, { merge: true });
      
      setEditMode(false);
      toast({
        title: "Profile updated!",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // Redirection will be handled by ProtectedRoute
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out.",
        variant: "destructive",
      });
    }
  };
  
  const handleRiskToleranceChange = (e) => {
    setFinancialPreferences({
      ...financialPreferences,
      riskTolerance: e.target.value,
    });
  };
  
  const handleInvestmentGoalsChange = (e) => {
    setFinancialPreferences({
      ...financialPreferences,
      investmentGoals: e.target.value,
    });
  };
  
  const handleSavingsTargetChange = (e) => {
    setFinancialPreferences({
      ...financialPreferences,
      savingsTarget: parseInt(e.target.value, 10) || 0,
    });
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1 border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10 bg-gradient-to-br from-blue-50 to-indigo-50">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <FiUser className="w-16 h-16 text-primary/40" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={loading || !editMode}
              >
                <FiCamera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
                disabled={loading || !editMode}
              />
            </div>
            <CardTitle className="text-xl font-bold">{displayName || "User"}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <FiMail className="text-blue-500" /> {email}
            </CardDescription>
            <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
              {financialPreferences.riskTolerance === "conservative" && "Conservative Investor"}
              {financialPreferences.riskTolerance === "moderate" && "Balanced Investor"}
              {financialPreferences.riskTolerance === "aggressive" && "Growth Investor"}
            </Badge>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button 
                variant={editMode ? "secondary" : "outline"} 
                className="w-full"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? (
                  <>
                    <FiRefreshCw className="mr-1" /> Cancel
                  </>
                ) : (
                  <>
                    <FiEdit className="mr-1" /> Edit Profile
                  </>
                )}
              </Button>
              <Button 
                variant={editMode ? "default" : "destructive"}
                className="w-full"
                onClick={editMode ? handleSaveProfile : handleLogout}
                disabled={loading}
              >
                {editMode ? (
                  <>
                    <FiSave className="mr-1" /> Save
                  </>
                ) : (
                  "Sign Out"
                )}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <p className="flex items-center justify-center gap-2 mb-1">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                Member since: {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : "Unknown"}
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                Last signed in: {currentUser?.metadata?.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : "Unknown"}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Details Card */}
        <Card className="md:col-span-2 border-t-4 border-t-indigo-500 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <Tabs defaultValue="personal" className="w-full">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold mb-1">Your Profile</CardTitle>
                <TabsList className="grid w-full max-w-md grid-cols-3 mb-2">
                  <TabsTrigger value="personal" className="text-xs sm:text-sm">
                    <FiUser className="mr-1 hidden sm:inline" /> Personal
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="text-xs sm:text-sm">
                    <FiDollarSign className="mr-1 hidden sm:inline" /> Financial
                  </TabsTrigger>
                  <TabsTrigger value="security" className="text-xs sm:text-sm">
                    <FiShield className="mr-1 hidden sm:inline" /> Security
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="personal" className="pt-4">
                <CardDescription className="mb-4">Update your personal details</CardDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="flex items-center gap-2">
                      <FiUser className="text-blue-500" /> Display Name
                    </Label>
                    <div className="relative">
                      <input
                        id="displayName"
                        type="text"
                        className={`w-full p-2 rounded-md border ${editMode ? 'bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-muted'}`}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={!editMode || loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <FiMail className="text-blue-500" /> Email
                    </Label>
                    <input
                      id="email"
                      type="email"
                      className="w-full p-2 rounded-md border bg-muted"
                      value={email}
                      disabled={true}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="financial" className="pt-4">
                <CardDescription className="mb-4">Set your financial preferences</CardDescription>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="riskTolerance" className="flex items-center gap-2">
                        <FiTarget className="text-indigo-500" /> Risk Tolerance
                      </Label>
                      <select
                        id="riskTolerance"
                        className={`w-full p-2 rounded-md border ${editMode ? 'bg-background focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' : 'bg-muted'}`}
                        value={financialPreferences.riskTolerance}
                        onChange={handleRiskToleranceChange}
                        disabled={!editMode || loading}
                      >
                        <option value="conservative">Conservative</option>
                        <option value="moderate">Moderate</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investmentGoals" className="flex items-center gap-2">
                        <FiTrello className="text-indigo-500" /> Investment Goals
                      </Label>
                      <select
                        id="investmentGoals"
                        className={`w-full p-2 rounded-md border ${editMode ? 'bg-background focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' : 'bg-muted'}`}
                        value={financialPreferences.investmentGoals}
                        onChange={handleInvestmentGoalsChange}
                        disabled={!editMode || loading}
                      >
                        <option value="retirement">Retirement</option>
                        <option value="education">Education</option>
                        <option value="home">Home Purchase</option>
                        <option value="wealth">Wealth Building</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="savingsTarget" className="flex items-center gap-2">
                      <FiCreditCard className="text-indigo-500" /> Monthly Savings Target (₹)
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        id="savingsTarget"
                        type="number"
                        className={`w-full pl-8 p-2 rounded-md border ${editMode ? 'bg-background focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' : 'bg-muted'}`}
                        value={financialPreferences.savingsTarget}
                        onChange={handleSavingsTargetChange}
                        disabled={!editMode || loading}
                        min="0"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Your annual savings goal: <span className="font-semibold text-indigo-600">₹{(financialPreferences.savingsTarget * 12).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="pt-4">
                <CardDescription className="mb-4">Manage your security settings</CardDescription>
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-md p-4 mb-6">
                    <h4 className="font-medium text-blue-700 mb-1 flex items-center gap-2">
                      <FiClipboard className="text-blue-600" /> Security Status
                    </h4>
                    <p className="text-sm text-blue-600">
                      Your account has {twoFactorEnabled ? 'enhanced' : 'basic'} security. 
                      {!twoFactorEnabled && ' We recommend enabling two-factor authentication.'}
                    </p>
                  </div>
                  <Separator />
                  
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border">
                      <div>
                        <Label htmlFor="twoFactor" className="block font-medium flex items-center gap-2">
                          <FiShield className="text-violet-500" /> Two-factor Authentication
                        </Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        id="twoFactor"
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                        disabled={!editMode || loading}
                        className="data-[state=checked]:bg-violet-600"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border">
                      <div>
                        <Label htmlFor="emailNotifications" className="block font-medium flex items-center gap-2">
                          <FiMail className="text-violet-500" /> Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive important financial updates and reports</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        disabled={!editMode || loading}
                        className="data-[state=checked]:bg-violet-600"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardFooter className="flex justify-end pt-0">
            {editMode && (
              <Button
                onClick={handleSaveProfile}
                disabled={loading}
                className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Save Changes
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}