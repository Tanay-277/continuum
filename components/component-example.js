"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentExample = ComponentExample;
var React = require("react");
var example_1 = require("@/components/example");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var combobox_1 = require("@/components/ui/combobox");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var field_1 = require("@/components/ui/field");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
function ComponentExample() {
  return (
    <example_1.ExampleWrapper>
      <CardExample />
      <FormExample />
    </example_1.ExampleWrapper>
  );
}
function CardExample() {
  return (
    <example_1.Example title="Card" className="items-center justify-center">
      <card_1.Card className="relative w-full max-w-sm overflow-hidden pt-0">
        <div className="bg-primary absolute inset-0 z-30 aspect-video opacity-50 mix-blend-color" />
        <img
          src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Photo by mymind on Unsplash"
          title="Photo by mymind on Unsplash"
          className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"
        />
        <card_1.CardHeader>
          <card_1.CardTitle>
            Observability Plus is replacing Monitoring
          </card_1.CardTitle>
          <card_1.CardDescription>
            Switch to the improved way to explore your data, with natural
            language. Monitoring will no longer be available on the Pro plan in
            November, 2025
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardFooter>
          <alert_dialog_1.AlertDialog>
            <alert_dialog_1.AlertDialogTrigger
              render={<button_1.Button />}
              data-testid="show-dialog-btn"
            >
              <lucide_react_1.PlusIcon data-icon="inline-start" />
              Show Dialog
            </alert_dialog_1.AlertDialogTrigger>
            <alert_dialog_1.AlertDialogContent size="sm">
              <alert_dialog_1.AlertDialogHeader>
                <alert_dialog_1.AlertDialogMedia>
                  <lucide_react_1.BluetoothIcon />
                </alert_dialog_1.AlertDialogMedia>
                <alert_dialog_1.AlertDialogTitle>
                  Allow accessory to connect?
                </alert_dialog_1.AlertDialogTitle>
                <alert_dialog_1.AlertDialogDescription>
                  Do you want to allow the USB accessory to connect to this
                  device?
                </alert_dialog_1.AlertDialogDescription>
              </alert_dialog_1.AlertDialogHeader>
              <alert_dialog_1.AlertDialogFooter>
                <alert_dialog_1.AlertDialogCancel data-testid="dialog-cancel">
                  Don&apos;t allow
                </alert_dialog_1.AlertDialogCancel>
                <alert_dialog_1.AlertDialogAction data-testid="dialog-allow">
                  Allow
                </alert_dialog_1.AlertDialogAction>
              </alert_dialog_1.AlertDialogFooter>
            </alert_dialog_1.AlertDialogContent>
          </alert_dialog_1.AlertDialog>
          <badge_1.Badge variant="secondary" className="ml-auto">
            Warning
          </badge_1.Badge>
        </card_1.CardFooter>
      </card_1.Card>
    </example_1.Example>
  );
}
var frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
var roleItems = [
  { label: "Developer", value: "developer" },
  { label: "Designer", value: "designer" },
  { label: "Manager", value: "manager" },
  { label: "Other", value: "other" },
];
function FormExample() {
  var _a = React.useState({
      email: true,
      sms: false,
      push: true,
    }),
    notifications = _a[0],
    setNotifications = _a[1];
  var _b = React.useState("light"),
    theme = _b[0],
    setTheme = _b[1];
  return (
    <example_1.Example title="Form">
      <card_1.Card className="w-full max-w-md">
        <card_1.CardHeader>
          <card_1.CardTitle>User Information</card_1.CardTitle>
          <card_1.CardDescription>
            Please fill in your details below
          </card_1.CardDescription>
          <card_1.CardAction>
            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger
                data-testid="menu-trigger"
                render={<button_1.Button variant="ghost" size="icon" />}
              >
                <lucide_react_1.MoreVerticalIcon />
                <span className="sr-only">More options</span>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent align="end" className="w-56">
                <dropdown_menu_1.DropdownMenuGroup>
                  <dropdown_menu_1.DropdownMenuLabel>
                    File
                  </dropdown_menu_1.DropdownMenuLabel>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.FileIcon />
                    New File
                    <dropdown_menu_1.DropdownMenuShortcut>
                      ⌘N
                    </dropdown_menu_1.DropdownMenuShortcut>
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.FolderIcon />
                    New Folder
                    <dropdown_menu_1.DropdownMenuShortcut>
                      ⇧⌘N
                    </dropdown_menu_1.DropdownMenuShortcut>
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuSub>
                    <dropdown_menu_1.DropdownMenuSubTrigger>
                      <lucide_react_1.FolderOpenIcon />
                      Open Recent
                    </dropdown_menu_1.DropdownMenuSubTrigger>
                    <dropdown_menu_1.DropdownMenuPortal>
                      <dropdown_menu_1.DropdownMenuSubContent>
                        <dropdown_menu_1.DropdownMenuGroup>
                          <dropdown_menu_1.DropdownMenuLabel>
                            Recent Projects
                          </dropdown_menu_1.DropdownMenuLabel>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.FileCodeIcon />
                            Project Alpha
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.FileCodeIcon />
                            Project Beta
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuSub>
                            <dropdown_menu_1.DropdownMenuSubTrigger>
                              <lucide_react_1.MoreHorizontalIcon />
                              More Projects
                            </dropdown_menu_1.DropdownMenuSubTrigger>
                            <dropdown_menu_1.DropdownMenuPortal>
                              <dropdown_menu_1.DropdownMenuSubContent>
                                <dropdown_menu_1.DropdownMenuItem>
                                  <lucide_react_1.FileCodeIcon />
                                  Project Gamma
                                </dropdown_menu_1.DropdownMenuItem>
                                <dropdown_menu_1.DropdownMenuItem>
                                  <lucide_react_1.FileCodeIcon />
                                  Project Delta
                                </dropdown_menu_1.DropdownMenuItem>
                              </dropdown_menu_1.DropdownMenuSubContent>
                            </dropdown_menu_1.DropdownMenuPortal>
                          </dropdown_menu_1.DropdownMenuSub>
                        </dropdown_menu_1.DropdownMenuGroup>
                        <dropdown_menu_1.DropdownMenuSeparator />
                        <dropdown_menu_1.DropdownMenuGroup>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.FolderSearchIcon />
                            Browse...
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuGroup>
                      </dropdown_menu_1.DropdownMenuSubContent>
                    </dropdown_menu_1.DropdownMenuPortal>
                  </dropdown_menu_1.DropdownMenuSub>
                  <dropdown_menu_1.DropdownMenuSeparator />
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.SaveIcon />
                    Save
                    <dropdown_menu_1.DropdownMenuShortcut>
                      ⌘S
                    </dropdown_menu_1.DropdownMenuShortcut>
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.DownloadIcon />
                    Export
                    <dropdown_menu_1.DropdownMenuShortcut>
                      ⇧⌘E
                    </dropdown_menu_1.DropdownMenuShortcut>
                  </dropdown_menu_1.DropdownMenuItem>
                </dropdown_menu_1.DropdownMenuGroup>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuGroup>
                  <dropdown_menu_1.DropdownMenuLabel>
                    View
                  </dropdown_menu_1.DropdownMenuLabel>
                  <dropdown_menu_1.DropdownMenuCheckboxItem
                    checked={notifications.email}
                    onCheckedChange={function (checked) {
                      return setNotifications(
                        __assign(__assign({}, notifications), {
                          email: checked === true,
                        }),
                      );
                    }}
                  >
                    <lucide_react_1.EyeIcon />
                    Show Sidebar
                  </dropdown_menu_1.DropdownMenuCheckboxItem>
                  <dropdown_menu_1.DropdownMenuCheckboxItem
                    checked={notifications.sms}
                    onCheckedChange={function (checked) {
                      return setNotifications(
                        __assign(__assign({}, notifications), {
                          sms: checked === true,
                        }),
                      );
                    }}
                  >
                    <lucide_react_1.LayoutIcon />
                    Show Status Bar
                  </dropdown_menu_1.DropdownMenuCheckboxItem>
                  <dropdown_menu_1.DropdownMenuSub>
                    <dropdown_menu_1.DropdownMenuSubTrigger>
                      <lucide_react_1.PaletteIcon />
                      Theme
                    </dropdown_menu_1.DropdownMenuSubTrigger>
                    <dropdown_menu_1.DropdownMenuPortal>
                      <dropdown_menu_1.DropdownMenuSubContent>
                        <dropdown_menu_1.DropdownMenuGroup>
                          <dropdown_menu_1.DropdownMenuLabel>
                            Appearance
                          </dropdown_menu_1.DropdownMenuLabel>
                          <dropdown_menu_1.DropdownMenuRadioGroup
                            value={theme}
                            onValueChange={setTheme}
                          >
                            <dropdown_menu_1.DropdownMenuRadioItem value="light">
                              <lucide_react_1.SunIcon />
                              Light
                            </dropdown_menu_1.DropdownMenuRadioItem>
                            <dropdown_menu_1.DropdownMenuRadioItem value="dark">
                              <lucide_react_1.MoonIcon />
                              Dark
                            </dropdown_menu_1.DropdownMenuRadioItem>
                            <dropdown_menu_1.DropdownMenuRadioItem value="system">
                              <lucide_react_1.MonitorIcon />
                              System
                            </dropdown_menu_1.DropdownMenuRadioItem>
                          </dropdown_menu_1.DropdownMenuRadioGroup>
                        </dropdown_menu_1.DropdownMenuGroup>
                      </dropdown_menu_1.DropdownMenuSubContent>
                    </dropdown_menu_1.DropdownMenuPortal>
                  </dropdown_menu_1.DropdownMenuSub>
                </dropdown_menu_1.DropdownMenuGroup>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuGroup>
                  <dropdown_menu_1.DropdownMenuLabel>
                    Account
                  </dropdown_menu_1.DropdownMenuLabel>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.UserIcon />
                    Profile
                    <dropdown_menu_1.DropdownMenuShortcut>
                      ⇧⌘P
                    </dropdown_menu_1.DropdownMenuShortcut>
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.CreditCardIcon />
                    Billing
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuSub>
                    <dropdown_menu_1.DropdownMenuSubTrigger>
                      <lucide_react_1.SettingsIcon />
                      Settings
                    </dropdown_menu_1.DropdownMenuSubTrigger>
                    <dropdown_menu_1.DropdownMenuPortal>
                      <dropdown_menu_1.DropdownMenuSubContent>
                        <dropdown_menu_1.DropdownMenuGroup>
                          <dropdown_menu_1.DropdownMenuLabel>
                            Preferences
                          </dropdown_menu_1.DropdownMenuLabel>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.KeyboardIcon />
                            Keyboard Shortcuts
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.LanguagesIcon />
                            Language
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuSub>
                            <dropdown_menu_1.DropdownMenuSubTrigger>
                              <lucide_react_1.BellIcon />
                              Notifications
                            </dropdown_menu_1.DropdownMenuSubTrigger>
                            <dropdown_menu_1.DropdownMenuPortal>
                              <dropdown_menu_1.DropdownMenuSubContent>
                                <dropdown_menu_1.DropdownMenuGroup>
                                  <dropdown_menu_1.DropdownMenuLabel>
                                    Notification Types
                                  </dropdown_menu_1.DropdownMenuLabel>
                                  <dropdown_menu_1.DropdownMenuCheckboxItem
                                    checked={notifications.push}
                                    onCheckedChange={function (checked) {
                                      return setNotifications(
                                        __assign(__assign({}, notifications), {
                                          push: checked === true,
                                        }),
                                      );
                                    }}
                                  >
                                    <lucide_react_1.BellIcon />
                                    Push Notifications
                                  </dropdown_menu_1.DropdownMenuCheckboxItem>
                                  <dropdown_menu_1.DropdownMenuCheckboxItem
                                    checked={notifications.email}
                                    onCheckedChange={function (checked) {
                                      return setNotifications(
                                        __assign(__assign({}, notifications), {
                                          email: checked === true,
                                        }),
                                      );
                                    }}
                                  >
                                    <lucide_react_1.MailIcon />
                                    Email Notifications
                                  </dropdown_menu_1.DropdownMenuCheckboxItem>
                                </dropdown_menu_1.DropdownMenuGroup>
                              </dropdown_menu_1.DropdownMenuSubContent>
                            </dropdown_menu_1.DropdownMenuPortal>
                          </dropdown_menu_1.DropdownMenuSub>
                        </dropdown_menu_1.DropdownMenuGroup>
                        <dropdown_menu_1.DropdownMenuSeparator />
                        <dropdown_menu_1.DropdownMenuGroup>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.ShieldIcon />
                            Privacy & Security
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuGroup>
                      </dropdown_menu_1.DropdownMenuSubContent>
                    </dropdown_menu_1.DropdownMenuPortal>
                  </dropdown_menu_1.DropdownMenuSub>
                </dropdown_menu_1.DropdownMenuGroup>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuGroup>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.HelpCircleIcon />
                    Help & Support
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.FileTextIcon />
                    Documentation
                  </dropdown_menu_1.DropdownMenuItem>
                </dropdown_menu_1.DropdownMenuGroup>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuGroup>
                  <dropdown_menu_1.DropdownMenuItem variant="destructive">
                    <lucide_react_1.LogOutIcon />
                    Sign Out
                    <dropdown_menu_1.DropdownMenuShortcut>
                      ⇧⌘Q
                    </dropdown_menu_1.DropdownMenuShortcut>
                  </dropdown_menu_1.DropdownMenuItem>
                </dropdown_menu_1.DropdownMenuGroup>
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
          </card_1.CardAction>
        </card_1.CardHeader>
        <card_1.CardContent>
          <form>
            <field_1.FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <field_1.Field>
                  <field_1.FieldLabel htmlFor="small-form-name">
                    Name
                  </field_1.FieldLabel>
                  <input_1.Input
                    id="small-form-name"
                    placeholder="Enter your name"
                    data-testid="name-input"
                    required
                  />
                </field_1.Field>
                <field_1.Field>
                  <field_1.FieldLabel htmlFor="small-form-role">
                    Role
                  </field_1.FieldLabel>
                  <select_1.Select items={roleItems} defaultValue={null}>
                    <select_1.SelectTrigger id="small-form-role">
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectGroup>
                        {roleItems.map(function (item) {
                          return (
                            <select_1.SelectItem
                              key={item.value}
                              value={item.value}
                              data-testid={`role-option-${item.value}`}
                            >
                              {item.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectGroup>
                    </select_1.SelectContent>
                  </select_1.Select>
                </field_1.Field>
              </div>
              <field_1.Field>
                <field_1.FieldLabel htmlFor="small-form-framework">
                  Framework
                </field_1.FieldLabel>
                <combobox_1.Combobox items={frameworks}>
                  <combobox_1.ComboboxInput
                    id="small-form-framework"
                    data-testid="framework-input"
                    placeholder="Select a framework"
                    required
                  />
                  <combobox_1.ComboboxContent>
                    <combobox_1.ComboboxEmpty>
                      No frameworks found.
                    </combobox_1.ComboboxEmpty>
                    <combobox_1.ComboboxList>
                      {function (item) {
                        return (
                          <combobox_1.ComboboxItem key={item} value={item}>
                            {item}
                          </combobox_1.ComboboxItem>
                        );
                      }}
                    </combobox_1.ComboboxList>
                  </combobox_1.ComboboxContent>
                </combobox_1.Combobox>
              </field_1.Field>
              <field_1.Field>
                <field_1.FieldLabel htmlFor="small-form-comments">
                  Comments
                </field_1.FieldLabel>
                <textarea_1.Textarea
                  id="small-form-comments"
                  placeholder="Add any additional comments"
                />
              </field_1.Field>
              <field_1.Field orientation="horizontal">
                <button_1.Button type="submit" data-testid="submit-btn">
                  Submit
                </button_1.Button>
                <button_1.Button variant="outline" type="button">
                  Cancel
                </button_1.Button>
              </field_1.Field>
            </field_1.FieldGroup>
          </form>
        </card_1.CardContent>
      </card_1.Card>
    </example_1.Example>
  );
}
