function getDestination({ Type }, resourceId) {
  if (!Type.startsWith("AWS::")) {
    return false
  }

  // Layers are typically shared, so keep in root stack
  if (Type === "AWS::Lambda::LayerVersion") {
    return false
  }

  let destination = Type.split("::")[1]

  // Avoid circular dependencies by keeping ApiGateway in the root stack
  if (destination.includes("ApiGateway")) {
    return false
  }

  if (destination === "Lambda") {
    return bucketLambda(resourceId)
  }

  return destination
}

function bucketLambda(resourceId) {
  return "Lambda" + resourceId[0].toUpperCase()
}

module.exports = (resource, resourceId) => {
  const destination = getDestination(resource, resourceId)
  if (destination) {
    console.log(`${resourceId} -> ${destination}`)
    return { destination }
  } else {
    console.log(`${resourceId} -> root stack`)
    return false
  }
}
