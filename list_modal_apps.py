import modal

def list_apps():
    client = modal.Client.from_env()
    apps = client.list_apps()
    for app in apps:
        print(f"App: {app.description} (Id: {app.app_id})")
        # Unfortunately, the client doesn't easily expose the web endpoint in this high-level list.
        # But we can try to lookup the app.
        try:
            lookup = modal.App.lookup(app.description)
            print(f"  Lookup successful for {app.description}")
        except:
            pass

if __name__ == "__main__":
    list_apps()
