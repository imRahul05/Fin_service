import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
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
  FiUser, FiCamera, FiSave, FiEdit,
  FiRefreshCw, FiCreditCard, FiTrello, FiTarget, FiClipboard, 
  FiMail, FiShield, FiDollarSign, FiSun, FiMoon, FiMonitor
} from "react-icons/fi";

export default function Profile() {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
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
  
  const fileInputRef = useRef(null);
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
          setEmailNotifications(data.emailNotifications ?? true);
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
      
      await updateUserProfile(displayName, photoURL);
      
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
    } catch {
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
    <div className="container mx-auto py-8 sm:py-12 px-4 max-w-6xl">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border/70 mb-3">
          Account & Security
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">Manage your account profile, risk appetite, and security preferences</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1 rounded-3xl bg-card border border-border/80 shadow-card">
          <CardHeader className="flex flex-col items-center text-center pb-2">
            <div className="relative mb-4 group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-border/80 bg-muted/50 flex items-center justify-center">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <FiUser className="w-14 h-14" />
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-foreground text-background p-2.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 cursor-pointer"
                disabled={loading || !editMode}
                title="Change photo"
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
            <CardTitle className="text-xl font-bold text-foreground">{displayName || "User"}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 text-muted-foreground mt-1 text-xs">
              <FiMail className="text-muted-foreground" /> {email}
            </CardDescription>
            <Badge variant="secondary" className="mt-3 rounded-full px-3 py-0.5 text-xs font-medium bg-muted text-foreground border border-border/60">
              {financialPreferences.riskTolerance === "conservative" && "Conservative Investor"}
              {financialPreferences.riskTolerance === "moderate" && "Balanced Investor"}
              {financialPreferences.riskTolerance === "aggressive" && "Growth Investor"}
            </Badge>
          </CardHeader>
          <CardContent className="text-center pt-2">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button 
                variant="outline" 
                className="w-full rounded-full border-border/80 text-foreground hover:bg-muted font-medium text-xs"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? (
                  <>
                    <FiRefreshCw className="mr-1.5 w-3.5 h-3.5" /> Cancel
                  </>
                ) : (
                  <>
                    <FiEdit className="mr-1.5 w-3.5 h-3.5" /> Edit Profile
                  </>
                )}
              </Button>
              <Button 
                variant={editMode ? "default" : "destructive"}
                className={`w-full rounded-full text-xs font-medium ${
                  editMode 
                    ? "bg-foreground text-background hover:bg-foreground/90 shadow-sm" 
                    : "rounded-full"
                }`}
                onClick={editMode ? handleSaveProfile : handleLogout}
                disabled={loading}
              >
                {editMode ? (
                  <>
                    <FiSave className="mr-1.5 w-3.5 h-3.5" /> Save
                  </>
                ) : (
                  "Sign Out"
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/40 p-3.5 rounded-2xl border border-border/60 space-y-1.5">
              <p className="flex items-center justify-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                Member since: {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : "Unknown"}
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-foreground/60"></span>
                Last signed in: {currentUser?.metadata?.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : "Unknown"}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Details Card */}
        <Card className="md:col-span-2 rounded-3xl bg-card border border-border/80 shadow-card">
          <CardHeader className="pb-3">
            <Tabs defaultValue="personal" className="w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
                <CardTitle className="text-xl font-bold text-foreground">Your Profile</CardTitle>
                <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-muted/60 p-1 rounded-full border border-border/60">
                  <TabsTrigger value="personal" className="rounded-full text-xs font-medium data-[state=active]:bg-foreground data-[state=active]:text-background transition-all">
                    <FiUser className="mr-1 hidden sm:inline" /> Personal
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="rounded-full text-xs font-medium data-[state=active]:bg-foreground data-[state=active]:text-background transition-all">
                    <FiDollarSign className="mr-1 hidden sm:inline" /> Financial
                  </TabsTrigger>
                  <TabsTrigger value="security" className="rounded-full text-xs font-medium data-[state=active]:bg-foreground data-[state=active]:text-background transition-all">
                    <FiShield className="mr-1 hidden sm:inline" /> Settings
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="personal" className="pt-4">
                <CardDescription className="mb-4 text-muted-foreground text-xs sm:text-sm">Update your personal account details</CardDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="flex items-center gap-2 text-foreground text-xs font-medium">
                      <FiUser className="text-muted-foreground" /> Display Name
                    </Label>
                    <div className="relative">
                      <input
                        id="displayName"
                        type="text"
                        className={`w-full p-3 rounded-2xl border text-sm transition-colors ${
                          editMode 
                            ? 'bg-background border-border/80 text-foreground focus:ring-2 focus:ring-foreground/20 focus:outline-none' 
                            : 'bg-muted/40 border-border/50 text-muted-foreground cursor-not-allowed'
                        }`}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={!editMode || loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-foreground text-xs font-medium">
                      <FiMail className="text-muted-foreground" /> Email Address
                    </Label>
                    <input
                      id="email"
                      type="email"
                      className="w-full p-3 rounded-2xl border border-border/50 bg-muted/40 text-muted-foreground text-sm cursor-not-allowed"
                      value={email}
                      disabled={true}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="financial" className="pt-4">
                <CardDescription className="mb-4 text-muted-foreground text-xs sm:text-sm">Configure your investment risk appetite and target savings rate</CardDescription>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="riskTolerance" className="flex items-center gap-2 text-foreground text-xs font-medium">
                        <FiTarget className="text-muted-foreground" /> Risk Tolerance
                      </Label>
                      <select
                        id="riskTolerance"
                        className={`w-full p-3 rounded-2xl border text-sm transition-colors ${
                          editMode 
                            ? 'bg-background border-border/80 text-foreground focus:ring-2 focus:ring-foreground/20 focus:outline-none' 
                            : 'bg-muted/40 border-border/50 text-muted-foreground cursor-not-allowed'
                        }`}
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
                      <Label htmlFor="investmentGoals" className="flex items-center gap-2 text-foreground text-xs font-medium">
                        <FiTrello className="text-muted-foreground" /> Primary Goal
                      </Label>
                      <select
                        id="investmentGoals"
                        className={`w-full p-3 rounded-2xl border text-sm transition-colors ${
                          editMode 
                            ? 'bg-background border-border/80 text-foreground focus:ring-2 focus:ring-foreground/20 focus:outline-none' 
                            : 'bg-muted/40 border-border/50 text-muted-foreground cursor-not-allowed'
                        }`}
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
                    <Label htmlFor="savingsTarget" className="flex items-center gap-2 text-foreground text-xs font-medium">
                      <FiCreditCard className="text-muted-foreground" /> Monthly Savings Target (₹)
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="text-muted-foreground text-sm font-medium">₹</span>
                      </div>
                      <input
                        id="savingsTarget"
                        type="number"
                        className={`w-full pl-9 p-3 rounded-2xl border text-sm transition-colors ${
                          editMode 
                            ? 'bg-background border-border/80 text-foreground focus:ring-2 focus:ring-foreground/20 focus:outline-none' 
                            : 'bg-muted/40 border-border/50 text-muted-foreground cursor-not-allowed'
                        }`}
                        value={financialPreferences.savingsTarget}
                        onChange={handleSavingsTargetChange}
                        disabled={!editMode || loading}
                        min="0"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <span>Projected annual savings:</span>
                      <span className="font-semibold text-foreground">₹{(financialPreferences.savingsTarget * 12).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="pt-4">
                <CardDescription className="mb-4 text-muted-foreground text-xs sm:text-sm">Manage security controls and interface appearance</CardDescription>
                <div className="space-y-6">
                  {/* Theme Selector Section */}
                  <div className="bg-muted/30 p-4 sm:p-5 rounded-2xl border border-border/60">
                    <Label className="block font-medium text-foreground mb-1 text-sm">
                      Appearance Theme
                    </Label>
                    <p className="text-xs text-muted-foreground mb-4">
                      Select light, dark, or system preference
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                          theme === "light"
                            ? "bg-foreground text-background border-foreground shadow-sm"
                            : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <FiSun className="w-4 h-4" /> Light
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                          theme === "dark"
                            ? "bg-foreground text-background border-foreground shadow-sm"
                            : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <FiMoon className="w-4 h-4" /> Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("system")}
                        className={`flex items-center justify-center gap-2 p-3 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                          theme === "system"
                            ? "bg-foreground text-background border-foreground shadow-sm"
                            : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <FiMonitor className="w-4 h-4" /> System
                      </button>
                    </div>
                  </div>

                  <div className="bg-muted/40 border border-border/70 rounded-2xl p-4">
                    <h4 className="font-semibold text-foreground text-xs sm:text-sm mb-1 flex items-center gap-2">
                      <FiClipboard className="text-muted-foreground" /> Security Status
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Your account has {twoFactorEnabled ? 'enhanced' : 'standard'} protection. 
                      {!twoFactorEnabled && ' Enable two-factor authentication for extra protection on financial data.'}
                    </p>
                  </div>
                  
                  <Separator className="border-border/60" />
                  
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/60">
                      <div>
                        <Label htmlFor="twoFactor" className="block font-medium text-foreground text-xs sm:text-sm flex items-center gap-2">
                          <FiShield className="text-muted-foreground" /> Two-Factor Authentication
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Prompt verification code upon login</p>
                      </div>
                      <Switch
                        id="twoFactor"
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                        disabled={!editMode || loading}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/60">
                      <div>
                        <Label htmlFor="emailNotifications" className="block font-medium text-foreground text-xs sm:text-sm flex items-center gap-2">
                          <FiMail className="text-muted-foreground" /> Email Alerts & Weekly Digest
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Receive monthly tax optimizations and anomalies</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        disabled={!editMode || loading}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardFooter className="flex justify-end pt-2 pb-6 px-6">
            {editMode && (
              <Button
                onClick={handleSaveProfile}
                disabled={loading}
                className="ml-auto rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold px-6 py-2.5 shadow-sm text-xs"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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