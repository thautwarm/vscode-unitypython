using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[RequireComponent(typeof(Traffy.Unity2D.UnityRTS))]
public class PythonHotLoader : MonoBehaviour
{
    // Start is called before the first frame update
    FileWatcher watcher;
    Traffy.Unity2D.UnityRTS rts;
    IEnumerator watching()
    {
        while (true)
        {
            if (watcher.CheckIfDirty())
            {
                rts.ReloadPython();
                watcher.isDirty = false;
            }
            yield return null;
        }
    }
    void Start()
    {
        rts = GetComponent<Traffy.Unity2D.UnityRTS>();
        rts.Init();
        var toWatch = System.IO.Path.Combine(rts.ProjectDirectory, "Compiled");
        watcher = FileWatcher.On(toWatch, "*.py.json");
        StartCoroutine(watching());
    }
}
