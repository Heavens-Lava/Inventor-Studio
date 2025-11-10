import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ExpenseSettings as ExpenseSettingsType, ExpenseCategory, PaymentMethod, CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from "@/types/expense";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExpenseSettingsProps {
  settings: ExpenseSettingsType;
  onSettingsChange: (settings: Partial<ExpenseSettingsType>) => void;
}

const THEME_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "gradient-blue", label: "Ocean Blue" },
  { value: "gradient-purple", label: "Purple Dream" },
  { value: "gradient-green", label: "Forest Green" },
  { value: "gradient-orange", label: "Sunset Orange" },
  { value: "gradient-pink", label: "Pink Blossom" },
];

const CURRENCY_OPTIONS = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

export const ExpenseSettings = ({ settings, onSettingsChange }: ExpenseSettingsProps) => {
  const [open, setOpen] = useState(false);

  const handleCurrencyChange = (code: string) => {
    const currency = CURRENCY_OPTIONS.find((c) => c.code === code);
    if (currency) {
      onSettingsChange({
        currency: currency.code,
        currencySymbol: currency.symbol,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Expense Tracker Settings</DialogTitle>
          <DialogDescription>
            Customize your expense tracking experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-4">
              {/* Currency */}
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={settings.currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Default Category */}
              <div className="space-y-2">
                <Label>Default Category</Label>
                <Select
                  value={settings.defaultCategory}
                  onValueChange={(value) =>
                    onSettingsChange({ defaultCategory: value as ExpenseCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Default Payment Method */}
              <div className="space-y-2">
                <Label>Default Payment Method</Label>
                <Select
                  value={settings.defaultPaymentMethod}
                  onValueChange={(value) =>
                    onSettingsChange({ defaultPaymentMethod: value as PaymentMethod })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
                      <SelectItem key={method} value={method}>
                        {PAYMENT_METHOD_LABELS[method]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Receipt Upload</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable receipt image attachments
                  </p>
                </div>
                <Switch
                  checked={settings.showReceiptUpload}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ showReceiptUpload: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Budget Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when approaching budget limits
                  </p>
                </div>
                <Switch
                  checked={settings.enableBudgetAlerts}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ enableBudgetAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Savings Insights</Label>
                  <p className="text-sm text-muted-foreground">
                    Show personalized savings recommendations
                  </p>
                </div>
                <Switch
                  checked={settings.enableSavingsInsights}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ enableSavingsInsights: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="space-y-4">
              {/* Color Scheme */}
              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select
                  value={settings.colorScheme}
                  onValueChange={(value) =>
                    onSettingsChange({ colorScheme: value as "light" | "dark" | "system" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Background Type */}
              <div className="space-y-2">
                <Label>Background Type</Label>
                <Select
                  value={settings.backgroundType}
                  onValueChange={(value) =>
                    onSettingsChange({ backgroundType: value as "theme" | "image" | "custom" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theme">Theme</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Selection (if theme background type) */}
              {settings.backgroundType === "theme" && (
                <div className="space-y-2">
                  <Label>Background Theme</Label>
                  <Select
                    value={settings.backgroundTheme}
                    onValueChange={(value) => onSettingsChange({ backgroundTheme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {THEME_OPTIONS.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Background Image URL (if image background type) */}
              {settings.backgroundType === "image" && (
                <div className="space-y-2">
                  <Label>Background Image URL</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={settings.backgroundImage || ""}
                    onChange={(e) => onSettingsChange({ backgroundImage: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to a background image
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
