export default function Terminal() {
  return (
    <div className="border rounded-sm bg-neutral-900 border-neutral-800 b">
      <div className="p-4 font-bold text-sm font-mono text-amber-500 bg-neutral-800">
        &gt; create new machine
        <br />
      </div>
      <pre className="p-4 text-white text-xs bg-neutral-900">
        <span className="text-sky-200">metalctl machine create</span> \
        <br />
        <span className="text-sky-500">--hostname</span> worker01 \
        <br />
        <span className="text-sky-500">--name</span> worker \
        <br />
        <span className="text-sky-500">--image</span> debian-12.0 \
        <br />
        <span className="text-sky-500">--size</span> t1-small-x86 \
        <br />
        <span className="text-sky-500">--partition</span> frankfurt-3a \
        <br />
        <span className="text-sky-500">--project</span> cluster01 \
        <br />
        <span className="text-sky-500">--sshpublickey</span>{" "}
        "@~/.ssh/id_rsa.pub"
      </pre>
    </div>
  );
}
